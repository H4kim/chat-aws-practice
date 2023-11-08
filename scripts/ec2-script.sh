#!/bin/bash

# This script is used to setup the ec2 instance at creation time It should be somewhere else but for learning
#---and practicing purposes i will keep it here and upload it manually at the creation time of the ec2 instance

# Install Docker
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user
sudo systemctl enable docker
sudo systemctl start docker

# Pull Docker image
docker pull h4kst3r/chat-app-aws:v1

# Get EC2 public IP address
TOKEN=`curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"`
public_ip=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -v http://169.254.169.254/latest/meta-data/public-ipv4)

# Run Docker image with environment variable and port mapping
docker run -d -p 80:3000 -e SERVER_INSTANCE_ID="$public_ip" h4kst3r/chat-app-aws:v1
