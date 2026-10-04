This project demonstrates how to deploy a static web application on AWS using a highly available and scalable architecture.

The application is hosted on Nginx running on Amazon EC2 instances, with an Application Load Balancer (ALB) distributing incoming traffic across multiple EC2 instances managed by an Auto Scaling Group (ASG).

The application files are stored in GitHub and automatically downloaded to newly launched EC2 instances using User Data.

## Project Structure

```
                         👤 USERS
                            │
                            │ HTTP Request
                            ▼
                       INTERNET
                            │
                            ▼
                   INTERNET GATEWAY
                            │
                            ▼
              APPLICATION LOAD BALANCER
                     (Internet-facing)
                            │
                    HTTP : 80
                            ▼
                 ┌─────────────────────┐
                 │    TARGET GROUP     │
                 └──────────┬──────────┘
                            │
             ┌──────────────┴──────────────┐
             │                             │
             ▼                             ▼
       Availability Zone 1          Availability Zone 2
       Public Subnet                Public Subnet
             │                             │
             ▼                             ▼
          EC2-1                         EC2-2
          Nginx                         Nginx
             │                             │
             ▼                             ▼
        Project-3                      Project-3

```

<h2>Process :</h2>

<h3>1. Project Set-up</h3>

1. Set your project on your local machine
eg:- windows

strucutre :

```
D:\Project-3\
│
├── index.html
├── style.css
└── script.js
```

2. Put Project-3 on GitHub

Create a GitHub repository, for example:
Project-3

Your repository should contain:

```
Project-3/
│
├── index.html
├── style.css
└── script.js
```
![](images/Screenshot%202026-10-03%20162721.png)

<h3>2.Create VPC</h3>

Create VPC with 2 subnets. For testing purpose i have used public subnets

<b>Setting :</b>

Go to VPC > Your VPC's > click "Create VPC" > set vpc name > set CIDR  > click "Create VPC"

![](images/Screenshot%202026-10-03%20124832.png)


<h3>2.Create Internet-Gateway</h3>

<b>Setting :</b>

 go to VPC > Internet Gateway > set name > click "create Internet Gateway" > select your internet gateway > click "Actions" > select "Attach to vpc" > select your vpc > click "Attach to VPC"

 ![](images/Screenshot%202026-10-03%20140550.png)
 ![](images/Screenshot%202026-10-03%20140631.png)


Configure Route Rable :

I configured VPC's main route table 

added :

0.0.0.0/0 --> igw

Go to VPC > Route Tables > Go inside VPC's main route table > under Routes tab > click "edit routes" > add route 0.0.0.0/ --> igw as shown below

![](images/Screenshot%202026-10-03%20140714.png)

<h3>3. Create Security Groups</h3>

 i have created security groups for Load balancer and EC2. 


Setting :

Go to EC2 > Security Groups > click "Create Security Group" > set name > select vpc > add rules > click "Create Security Group"

check following SG's:
![](images/Screenshot%202026-10-03%20125530.png)

![](images/Screenshot%202026-10-03%20125731.png)

<h3>4. Create Subnets</h3>

Go to VPC > Subnets > click "Create Subnet" > set name > select AZ >set IPv4 CIDR block > click "create subnets"

![](images/Screenshot%202026-10-03%20125000.png)

![](images/Screenshot%202026-10-03%20125037.png)

<h3>5. Create Launch Templates</h3>

Go to EC2 > Launch Templates > click "Create Launch Templates" > set name > select AMI > select instance type(select free tier) > key pair > select security group (here select security group you created for Ec2 Instance) > under "Additional Details" > go to "User Data" option> here set the required configuration for EC2 

![](images/Screenshot%202026-10-03%20140934.png)

![](images/Screenshot%202026-10-03%20140941.png)

![](images/Screenshot%202026-10-03%20140951.png)

![](images/Screenshot%202026-10-03%20140958.png)

![](images/Screenshot%202026-10-03%20141303.png)

Configuration I did :

```
#!/bin/bash

# Update packages
yum update -y

# Install Nginx and Git
sudo yum install  nginx -y
sudo yum install git -y

# Start and enable Nginx
systemctl enable nginx
systemctl start nginx

# Remove default Nginx page
rm -rf /usr/share/nginx/html/*

# Clone application
git clone https://github.com/Vaid07-Techy/Project-3.git /tmp/Project-3

# Copy application files to Nginx web root
cp /tmp/Project-3/index.html /usr/share/nginx/html/
cp /tmp/Project-3/style.css /usr/share/nginx/html/
cp /tmp/Project-3/script.js /usr/share/nginx/html/

# Restart Nginx
systemctl restart nginx
```
<b>how this works?</b>

Every time ASG launches an EC2:
```
EC2 starts
   ↓
User Data executes
   ↓
Install Nginx
   ↓
Install Git
   ↓
Clone Project-3
   ↓
Copy files to Nginx
   ↓
Start Nginx
```

So you don't have to manually configure each instance.

<h3>6. Create Target Group</h3>

setting :

Go to EC2 > Target Groups > click "Create Target Group" > select "Instances" > set name > set protocol : http and port: 80> select your VPC > set health checks 

![](images/Screenshot%202026-10-03%20141602.png)

![](images/Screenshot%202026-10-03%20141633.png)

![](images/Screenshot%202026-10-03%20141746.png)

The ALB will periodically ask:
```
GET /
```

If Nginx returns a successful response, the instance becomes:
```
Healthy
```

<h3>7. Create Load Balancer</h3>

<b>setting :</b>

Go to EC2 > Load Balancers > select ALB >set name > select "Internet Facing" > Under Network Mapping select your VPC > select all AZs > select security group(select Sg you created for alb) > select routing action to "Forward to target groups" > select your created target group > click "create Load Balancer"


![](images/Screenshot%202026-10-03%20142227.png)

![](images/Screenshot%202026-10-03%20142249.png)

![](images/Screenshot%202026-10-03%20142308.png)

![](images/Screenshot%202026-10-03%20142349.png)


<h3>7. Create Auto Scaling Group</h3>

Go to EC2> Auto Scaling Group > click "Create Auto Scaling Group" > set name > under launch template select your created launch template > click "next"

![](images/Screenshot%202026-10-03%20142845.png)

select vpc > select AZs > click "next"

![](images/Screenshot%202026-10-03%20142933.png)

under load balancing section select "attach to existing load balancer" > select "choose from existing load balancer target group" > select your "created load balancer" > under health check section enable the "Turn on Elastic Load Balancing health checks" > click next

![](images/Screenshot%202026-10-03%20143208.png)

![](images/Screenshot%202026-10-03%20143222.png)


now configure group size and scaling >set minimum,maximum and desired capacity > select "target tracking scaling policy" > select metric type and target value > click "create create Auto scaling group"

![](images/Screenshot%202026-10-03%20143247.png)

after few seconds ASG will automatically launch instances

![](images/Screenshot%202026-10-03%20143825.png)

<h3>8. Check Health Of Targets</h3>

![](images/Screenshot%202026-10-03%20150507.png)

here one instance is healthy and other is healthy.

Troubleshoot :

when i was checking the structure i got to know that i didn't enabled the "Auto assign IPv4 address" option in subnet settings

Because i did not enabled the option the instances launched inside those subnets was not assigned with Public IP and hence the instances was not able to communicate with the internet

check following Screenshots:

![](images/Screenshot%202026-10-03%20150507.png)

![](images/Screenshot%202026-10-03%20150533.png)

<h3>9. Output</h3>

used ALB DNS name to access the web app

![](images/Screenshot%202026-10-03%20150622.png)

![](images/Screenshot%202026-10-03%20150702.png)

