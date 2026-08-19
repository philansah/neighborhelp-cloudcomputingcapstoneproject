# NeighborHelp – AWS Free Tier Production Deployment Plan

> **Project:** NeighborHelp – Neighborhood Skill & Service Exchange Platform  
> **Infrastructure Model:** AWS Free Tier Architecture  
> **Version:** 1.0.0  

---

## 1. High-Level AWS Architecture Diagram

```mermaid
graph TD
    User[Client Web Browser / Mobile User]
    Route53[AWS Route 53 / DNS]
    ALB[Application Load Balancer - Free Tier]
    
    subgraph SecurityGroup_ALB["ALB Security Group (sg-alb)"]
        ALB_Rule["Inbound: Port 80 (HTTP) & Port 443 (HTTPS) from 0.0.0.0/0"]
    end
    
    subgraph VPC["Default VPC / Public Subnets"]
        EC2[AWS EC2 Instance - t2.micro / t3.micro]
        
        subgraph SecurityGroup_EC2["EC2 Security Group (sg-ec2)"]
            EC2_Rule1["Inbound: Port 3000 (Next.js) from ALB Security Group"]
            EC2_Rule2["Inbound: Port 22 (SSH) from Admin IP Only"]
        end

        CloudWatch[AWS CloudWatch Logs & Metrics]
    end

    subgraph AWS_Managed_Services["AWS Managed Cloud Infrastructure"]
        S3[AWS S3 Bucket - neighborhelp-uploads]
        RDS[(AWS RDS PostgreSQL - db.t2.micro)]
        
        subgraph SecurityGroup_RDS["RDS Security Group (sg-rds)"]
            RDS_Rule["Inbound: Port 5432 (PostgreSQL) from EC2 Security Group Only"]
        end
    end

    User -->|HTTPS Request| ALB
    ALB -->|Forward to Port 3000| EC2
    EC2 -->|DB Queries (Port 5432)| RDS
    EC2 -->|Presigned Upload URLs & Image Delivery| S3
    EC2 -->|Stream JSON Application Logs & Metrics| CloudWatch
```

---

## 2. AWS Free Tier Resource Allocation Matrix

| Service | Free Tier Limits | Configured Specs | Rationale |
| :--- | :--- | :--- | :--- |
| **AWS EC2** | 750 hrs/mo (750 hrs = 1 instance running 24/7) | `t2.micro` or `t3.micro` (1 vCPU, 1 GB RAM, Ubuntu 24.04 LTS, 30 GB EBS) | Host Next.js web server and Node API process manager (PM2) |
| **AWS RDS** | 750 hrs/mo + 20 GB Single-AZ SSD storage | `db.t2.micro` or `db.t3.micro` PostgreSQL 15 | Dedicated PostgreSQL database replacing local SQLite for production data integrity |
| **AWS S3** | 5 GB Standard Storage + 20,000 GET / 2,000 PUT Requests | Bucket: `neighborhelp-uploads` (us-east-1) | Direct client image uploads & verification proof documents |
| **AWS ALB** | 750 hrs/mo + 15 LCU (Load Balancer Capacity Units) | Internet-facing ALB with HTTP (80) & HTTPS (443) rules | Health checks, SSL/TLS termination, and zero-downtime traffic routing |
| **AWS CloudWatch** | 5 GB Log Data + 10 Custom Metrics + 3 Alarms | Log Group: `/neighborhelp/app-logs` | Stream error logs, S3 upload counts, and API latency metrics |
| **Security Groups** | Unlimited | `sg-alb`, `sg-ec2`, `sg-rds` | Strict least-privilege network firewalls |

---

## 3. Step-by-Step Deployment Execution Guide

### Phase 1: Security Groups Setup (Least Privilege)

1. **Create `sg-alb` (Application Load Balancer Security Group)**:
   - **Inbound Rules**:
     - Type: `HTTP` | Port: `80` | Source: `0.0.0.0/0`
     - Type: `HTTPS` | Port: `443` | Source: `0.0.0.0/0`
   - **Outbound Rules**: All traffic (`0.0.0.0/0`).

2. **Create `sg-ec2` (Next.js Application Security Group)**:
   - **Inbound Rules**:
     - Type: `Custom TCP` | Port: `3000` | Source: `sg-alb` (Only allow ALB traffic)
     - Type: `SSH` | Port: `22` | Source: `Your-My-IP/32` (Only allow admin SSH)
   - **Outbound Rules**: All traffic (`0.0.0.0/0`).

3. **Create `sg-rds` (PostgreSQL Database Security Group)**:
   - **Inbound Rules**:
     - Type: `PostgreSQL` | Port: `5432` | Source: `sg-ec2` (Only allow EC2 server traffic)
   - **Outbound Rules**: None.

---

### Phase 2: AWS S3 Bucket Setup

1. Navigation: Go to **S3 Console** -> **Create Bucket**.
2. Bucket Name: `neighborhelp-uploads-prod`.
3. Region: `us-east-1`.
4. CORS Configuration:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

---

### Phase 3: AWS RDS PostgreSQL Provisioning

1. Navigation: **RDS Console** -> **Create Database**.
2. Engine: `PostgreSQL` (Version 15 or 16).
3. Template: **Free Tier**.
4. Database Instance Identifier: `neighborhelp-db`.
5. Master Credentials:
   - User: `neighboradmin`
   - Password: `[Generated-Strong-Password]`
6. Instance Configuration: `db.t2.micro` or `db.t3.micro`.
7. Storage: `20 GB General Purpose SSD (gp2)`.
8. Connectivity:
   - VPC: Default VPC.
   - Publicly Accessible: **No**.
   - VPC Security Group: Choose `sg-rds`.
9. Initial Database Name: `neighborhelp_prod`.

---

### Phase 4: AWS EC2 Instance Provisioning & Server Setup

1. **Launch EC2 Instance**:
   - AMI: Ubuntu Server 24.04 LTS (Free Tier Eligible).
   - Instance Type: `t2.micro` or `t3.micro`.
   - Security Group: Attach `sg-ec2`.
   - Key Pair: Create and download `neighborhelp-key.pem`.

2. **SSH into EC2 Instance**:
   ```bash
   chmod 400 neighborhelp-key.pem
   ssh -i "neighborhelp-key.pem" ubuntu@<EC2-PUBLIC-IP>
   ```

3. **Install Dependencies & Node.js 20**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs git build-essential
   sudo npm install -g pm2
   ```

4. **Clone Codebase & Environment Setup**:
   ```bash
   git clone https://github.com/your-username/neighborhelp.git
   cd neighborhelp
   npm install
   ```

5. **Configure Production `.env` File**:
   ```env
   NODE_ENV=production
   PORT=3000
   DATABASE_URL="postgresql://neighboradmin:[PASSWORD]@[RDS-ENDPOINT]:5432/neighborhelp_prod?schema=public"
   JWT_SECRET="prod-super-secret-neighborhelp-jwt-key-2026"
   AWS_REGION="us-east-1"
   S3_BUCKET_NAME="neighborhelp-uploads-prod"
   ```

6. **Run Migration & Database Seed**:
   ```bash
   # Update prisma/schema.prisma datasource from sqlite to postgresql
   npx prisma db push
   node prisma/seed.js
   npm run build
   ```

7. **Start Application with PM2**:
   ```bash
   pm2 start npm --name "neighborhelp-app" -- start
   pm2 save
   pm2 startup
   ```

---

### Phase 5: Application Load Balancer (ALB) Setup

1. **Create Target Group**:
   - Target Type: `Instances`.
   - Target Group Name: `tg-neighborhelp-3000`.
   - Protocol: `HTTP` | Port: `3000`.
   - Health Check Path: `/api/auth/me`.
   - Register Targets: Select EC2 instance and add to target list.

2. **Create Load Balancer**:
   - Type: `Application Load Balancer`.
   - Name: `alb-neighborhelp`.
   - Scheme: `Internet-facing`.
   - Security Group: `sg-alb`.
   - Listeners:
     - `HTTP (80)` -> Forward to `tg-neighborhelp-3000`.
     - `HTTPS (443)` -> Attach AWS Certificate Manager (ACM) free SSL cert -> Forward to `tg-neighborhelp-3000`.

---

### Phase 6: AWS CloudWatch Logging Integration

1. IAM Role Attachment: Attach `CloudWatchAgentServerPolicy` to EC2 Instance IAM Role.
2. Verify log stream entries under Log Group `/neighborhelp/app-logs`.
3. Set Alarms:
   - Alarm 1: EC2 CPU Utilization > 85% for 5 minutes.
   - Alarm 2: ALB 5XX HTTP Error Count > 10.

---

## 4. Operational Maintenance & Rollback Plan

- **Database Backups**: RDS automatic daily snapshots enabled (7-day retention within Free Tier limits).
- **Code Updates**:
  ```bash
  git pull origin main
  npm install
  npx prisma db push
  npm run build
  pm2 reload neighborhelp-app
  ```
