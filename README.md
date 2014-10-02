*Last updated date: 07/25/2014*

*By: Keith Chester*

# Infrastructure
This document generally explains the planned architecture for the taffer back end.

The architecture is broken down into four main segments:

* Network
* Databases
* Servers
* Auto scaling group

---

## Networks
Networking can be broken down into several segments:

* Virtual Private Cloud (VPC)
    * Private and public subnets
* Load balancer
    * Internet gateway
* Route53

### VPC
* The VPC for taffer use's a small instance for its NAT.
* Use a VPC CIDR of 10.0.0.0/16
* No regional preference for NAT - there is no failover for this planned (or possible?)

### Subnets
* Three public subnets and three private subnets - one for each regional zone
* Security group for public subnets should be:

|    Type    |    Protocol    |    Port Range    |    Source    |
|---         |                |                  |              |
| SSH (22)   | TCP (6)        | 22               | 0.0.0.0/0    |
| HTTP (80)  | TCP (6)        | 80               | 0.0.0.0/0    |
| HTTPS (443)| TCP (6)        | 443              | 0.0.0.0/0    |

* Security group for the private subnet should read:

|    Type    |    Protocol    |    Port Range    |    Source    |
|---         |                |                  |              |
| ALL TCP    | TCP (6)        | 27107            | public sg    |
| ALL TCP    | TCP (6)        | 27107            | private sg   |

* *Note: "public sg" is the public security group created - the DB will only accept MongoDB connections from that security group and no one else.*

* *The "private sg" is the private security group - self referential.*

### Internet Gateway
Just create one and attach it to the VPC - no other actions needed.

### Load Balancer

#### 1 - Listening Protocol
Create a load balancer within the VPC created. Set load balancing protocol to 80 and 443 (if you have SSL cert).

#### 2 - Health Check
|    Setting          |    Value    |
|---                  |             |
|    Ping Protocol    |    HTTP     |
|    Ping Port        |    80       |
|    Ping Path        |    /health  |

Advanced details are to be fussed around with, but I like the lower check interval.

#### 3 - Add EC2 instances
Don't do this stage - the auto-staging group will take care of this bit for us.

### Route53
TBD

---

##Databases
* Databases are MongoDB, typical install via Ubuntu LTS.
* All configuration is through /etc/mongodb.conf (see Configuration section)
* There are three databases - m1.large through aws - one in each private subnet you created.
* There is a fourth "db" that will be running on a micro instance. This is our arbiter.
* Each database will make use of an elastc IP assigned. I couldnt' figure out a way around this as we need to tell each database the IP of every other db *without* setting up a custom DHCP server.

### Initial setup
1. Decide on a hostname for each DB. (ie: mongo0.taffer.com, arbiter.taffer.com. You do not need to own the domain taffer.com either)
2. Edit /etc/hosts. 127.0.0.1 should point to localhost. A second 127.0.0.1 entry should point to the hostname that the db represents. Every other db hostname should point towards their respective DB.
3. Edit /etc/hostname to be just the chosen hostname for the db.
4. sudo hostname chosenhostname.com
5. Reconnect to the instance to confirm hostname configurations.
6. Edit the configuration files:

###Configuration file - /etc/mongodb.conf
|    Option        |    Value        |
|---               |                 |
|    bind_ip       | commented out   |
|    port          | 27017           |
|    fork          | true            |
|    replSet       | rs0             |

#### Arbiter additional settings
Additional changes for the arbiter include:

|    Option        |    Value        |
|---               |                 |
|    journal       | false           |
|    smallfiles    | true            |

### Initiating replication sets
The replication sets must be manually initiated. For this part, you must have
the machines launched within their private subnets with their elastic IPs
assigned. Because of this, you must open the private security group up to the
world (or just your IP range) and ssh into these boxes. Remember to close this
security hole when you are finished.

1. Start all dbs and the arbiter.
2. You only need to log into one machine (your chosen initial primary) for this,
though you may decide to log into all to tail -f their log files.
3. Once logged in, type rs.initiate()
4. rs.conf() to confirm that a replica set configuration object was created.
5. rs.add("chosenhostname.com") to add each db to the replica set.
6. rs.addArb("arbiter.hostname.com") to add the arbiter machine.


    rs.initiate()
    rs.conf()
    rs.add("chosenhostname.com")
    rs.addArb("arbiter.hostname.com")


### Server / Mongoose DB Connection
In Mongoose, declare each database as their IPs in a comma delimited list such as this:

    "mongodb://75.101.128.35/ping,mongodb://54.227.244.117,mongodb://75.101.165.224"

The database only needs to be declared in one of the URIs. Do not add the arbiter as an option.

And the mongodb options object should have the following attribute:

    replset: {
		rs_name: 'rs0',
	}

### Setup alarms
Create server downage alarms for each DB server to contact the development team.

### Backup Solution
TBD

This will likely evolve around bringing up a permenant secondary, letting it sync / replicate
and then bringing it down to image.

---

##Servers
There are API servers, an admin server, and a daemon server.

All app servers will be Ubuntu 14.04 LTS. Each server will be a medium instance.

### Initial software
Install node, git, nginx, and graphicsmagick

    sudo add-apt-repository ppa:chris-lea/node.js
    sudo apt-get update
    sudo apt-get install nodejs git graphicsmagick nginx gcc make build-essential

### nginx Configuration
Edit /etc/nginx/sites-available/default to contain the following:

    server {
        listen 80 default_server;
        listen [::]:80 default_server ipv6only=on;

        root /usr/share/nginx/html;
        index index.html index.htm;

        # Make site accessible from http://localhost/
        server_name localhost;

        location / {
                proxy_pass http://localhost:PORT;
                include /etc/nginx/proxy_params;
        }
    }

...where PORT is replaced with the set port the node app will be listening on.


### Auto-launch node app
Create a bash script with the following:

    #! /usr/bin/env bash
    export ENVIRONMENT_VARIABLE=KEY
    export ENVIRONMENT_VARIABLE2=KEY2
    export ENVIRONMENT_VARIABLE3=KEY3

    cd /home/ubuntu/taffer-backend
    node server.js &

Put this script in /etc/init.d/ and then execute

    sudo update-rc.d SCRIPTNAME defaults

The last line, node server.js &, may be modified to be the daemon or admin servers.


### Environment Variables
|    Key                    |    Example Value            |    Description                         |
|---                        |                             |                                        |
| PORT                      | 7000                        | Port from which app will listen        |
| MONGODB_URI               | mongodb://hostname/taffer   | URI(s) of mongodb instance(s) for db   |
| MONGODB_OPTIONS           | replset: { rs_name: 'rs0' } | JSON String of mongo options           |
| COOKIE_SECRET             | random hash                 | The secret used for signing cookies    |
| IMAGE_BUCKET              | taffer-bucket               | Name of the image bucket on s3         |
| AWS_ACCESS_KEY_ID         | AKIAJN5YNRA3SKPPH7BQ        | App key ID for Amazon API              |
| AWS_SECRET_ACCESS_KEY     | SwolCZefSY1g+mz24y+tv8Vm6   | App key secret for Amazon API          |
| TWILIO_ACCOUNT_SID        | AC09a278e75bd62a            | Twilio API Account SID                 |
| TWILIO_ACCOUNT_AUTH_TOKEN | f9942a18b5bfc914cc          | Twilio API Account Authenticaton Token |
| TWILIO_PHONE_NUMBER       | 555-867-5309                | Twilio Phone Number                    |


### API Server
This is initiated by running


    node server.js &



### Admin Server
This is initiated by running


    node adminServer.js &


### Daemon Server
This is initiated by running


    node daemonServer.js &

### Create an image
Create an image for each of these. The admin server can be placed in any of the three
public subnets. The daemon server should be launched in any of the three private subnets.
The API server will be handled by the auto-scaling group.

---

## Auto Scaling Group

### Launch Configuration Creation

1. Choose the image created for the api server.
2. Select an m3.medium
3. Name the launch configuration. Under advanced details ensure that Assign a Public
IP address to every instance is not checked.
4. Default storage is fine (8gb)
5. Use the public subnet security group you created

### Create the Auto Scaling group
1. Name the group and set the Network to our created VPC. Add each public subnet.
Under advanced options, set the Health Check Grace Period to 60-90 seconds.
2. Setup scaling group policies
3. Set the name tag to make these instances easier to identify.

### Scaling alarms
Setup network and CPU usage alarms to trigger scaling events. Specifics TBD.

---

## Updating the App
1. Create an instance off of the API server image into EC2 - not a subnet.
2. Connect to the server and git pull / update the app however is needed.
3. Shut down the instance and create a new image. Name the image with a version
number and date.
4. Terminate the instance.
5. Create a new launch configuration, matching all settings from the prior configuration
save the image choice.
6. Ensure you have at least two instances already running in the auto-scaling group.
7. Modify the auto-scaling group to use the new launch configuration.
8. Ensure you have at least two instances already running.
9. Kill one instance. Wait for the new instance/image to be launched.
10. Once the load balancer reports the instance as healthy, kill the remaining old
instance.

---

## Additional Notes
These are additional notes that do not necessarily apply to the above sections, but
still must be considered when deploying.

### Amazon API Access
A user needs to be created for the Taffer app to access our Amazon's S3 storage.
Use limited credentials/permissions to allow this user access to only S3, and only
the appropriate buckets.
