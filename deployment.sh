# Remove Old Build
rm -rf dest/
rm -rf dest.zip

# Create New Build and Swagger
npm run build
zip -r dest.zip dest/

EC2_HOST=ec2-user@ec2-13-127-185-39.ap-south-1.compute.amazonaws.com

# Remove old dest/
ssh -i $HOME/litchiesatf2023.pem $EC2_HOST "rm -rf attendease/dest/"

# Copy package.json in AWS EC2
scp -i $HOME/litchiesatf2023.pem package.json $EC2_HOST:~/attendease/

# Copy .env in AWS EC2
scp -i $HOME/litchiesatf2023.pem .env $EC2_HOST:~/attendease/

# Copy build in AWS EC2
scp -i $HOME/litchiesatf2023.pem dest.zip $EC2_HOST:~/attendease/

# Deploy in EC2
ssh -i $HOME/litchiesatf2023.pem $EC2_HOST "cd attendease/; npm i;  unzip dest.zip ; npm run delete ; npm run pm2 ; rm -rf dest.zip"