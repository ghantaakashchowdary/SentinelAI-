/**
 * Pre-configured Demonstration Scenarios for Smart India Hackathon
 * Project: AI-Based Network Attack Forecasting from Network Traffic Data
 * 
 * Supports dual presentation:
 * 1. Plain, human-understandable language by default for non-technical judges
 * 2. Deep technical cybersecurity telemetry revealed on mouse hover / inspection
 */

export const SCENARIOS = [
  {
    id: 'ddos-syn-flood',
    title: 'Distributed SYN Flood & UDP Amplification',
    simpleTitle: 'Severe Server Jam Attack (DDoS)',
    shortName: 'DDoS SYN Flood',
    simpleShortName: 'DDoS Server Jam',
    severity: 'Critical',
    riskScore: 92,
    confidence: 96.4,
    horizon: 'T + 15 min',
    simpleHorizon: 'Danger in 15 mins',
    
    // Plain-English for normal people
    simpleSummary: 'The AI detected a massive wave of fake connection requests trying to overwhelm our server memory. If we don\'t block them now, real users will be locked out and the website will crash in about 15 minutes.',
    // Full Technical Summary (shown on hover)
    summary: 'Bi-LSTM sequence model detects early-stage TCP SYN backlogging with abnormal entropy decay. Forecasting models project complete ingress pipe saturation within 14.8 minutes without automated rate-limiting and BGP blackholing.',
    
    predictedAttack: 'Distributed SYN Flood & UDP Amplification',
    simpleAttack: 'Severe Traffic Flood & Server Jam (DDoS)',
    
    primaryVector: 'TCP Half-Open SYN Exhaustion',
    simplePrimaryVector: 'Flooding server memory with fake requests',
    
    secondaryVector: 'NTP/DNS Ingress Reflection',
    simpleSecondaryVector: 'Bouncing attack traffic off external helper servers',
    
    targetAssets: ['Core Ingress Edge 10.0.1.1', 'API Gateway Cluster (4 nodes)', 'Auth Microservice'],
    simpleTargetAssets: ['Main Website Gateway (10.0.1.1)', 'Login & User Services'],
    
    attackerProfiles: [
      {
        ip: '185.220.101.5',
        asn: 'AS208323 (Tor Exit)',
        country: 'Germany 🇩🇪',
        threatScore: 98,
        simpleDesc: 'High-risk automated botnet computer',
        techDetails: 'Tor Exit Node • 2.45M probe packets • 1,420 open half-connections'
      },
      {
        ip: '194.26.29.112',
        asn: 'AS44034 (Hi-Speed)',
        country: 'Russia 🇷🇺',
        threatScore: 94,
        simpleDesc: 'Bulletproof scanner machine',
        techDetails: 'Bulletproof Hosting Scanner • High-frequency handshake probes'
      },
      {
        ip: '45.154.255.89',
        asn: 'AS200052 (Hosting)',
        country: 'Bulgaria 🇧🇬',
        threatScore: 91,
        simpleDesc: 'Fast request spammer',
        techDetails: 'SYN Flood Worker Node • 76 packets/burst without ACK responses'
      }
    ],

    // Multi-Step Forecast Progression (Simple + Technical on hover)
    timeline: [
      {
        step: 'T0 (Current)',
        timeOffset: 'Now',
        stage: 'Reconnaissance & SYN Probing',
        simpleStage: '1. Testing the Waters (Attackers Scouting)',
        riskLevel: 'Elevated',
        riskScore: 74,
        simpleSynRatio: '8x more fake requests than normal',
        synRatio: '8.4x baseline (TCP SYN flags)',
        simplePacketRate: '128,400 requests / sec',
        packetRate: '128,400 pps',
        simpleBandwidth: '1.8 Gbps (Moderate Stream)',
        bandwidth: '1.8 Gbps',
        simpleCpuImpact: 'Server working at 42% load',
        cpuImpact: '42% CPU',
        simpleStateDesc: 'Suspicious devices are testing our doors with rapid fake requests to see if our system responds.',
        stateDesc: 'Botnet nodes initiating synchronized probe packets across edge port 443 with randomized source ports.'
      },
      {
        step: 'T + 5 min',
        timeOffset: '+5 min',
        stage: 'Backlog Queue Saturation',
        simpleStage: '2. Server Memory Starting to Fill Up',
        riskLevel: 'Critical',
        riskScore: 86,
        simpleSynRatio: '14x more fake requests',
        synRatio: '14.2x baseline',
        simplePacketRate: '410,000 requests / sec',
        packetRate: '410,000 pps',
        simpleBandwidth: '4.6 Gbps (Heavy Ingress)',
        bandwidth: '4.6 Gbps',
        simpleCpuImpact: 'Server slowing down (68% load)',
        cpuImpact: '68% CPU',
        simpleStateDesc: 'Server memory queue is 78% full. Real users are starting to notice lag and slow loading.',
        stateDesc: 'SYN queue memory allocation hits 78%. Half-open connection table begins dropping legitimate client handshakes.'
      },
      {
        step: 'T + 15 min',
        timeOffset: '+15 min',
        stage: 'Volumetric Peak Escalation',
        simpleStage: '3. Peak Traffic Jam (Website Crashes)',
        riskLevel: 'Critical',
        riskScore: 96,
        simpleSynRatio: '32x fake flood surge',
        synRatio: '32.6x baseline',
        simplePacketRate: '1.45 Million requests / sec',
        packetRate: '1,450,000 pps',
        simpleBandwidth: '12.4 Gbps (Pipe Overload)',
        bandwidth: '12.4 Gbps',
        simpleCpuImpact: 'Server at 99% (Near Collapse)',
        cpuImpact: '99% CPU',
        simpleStateDesc: 'Full attack peak hits. The server is completely overwhelmed; real users cannot open the website.',
        stateDesc: 'Full botnet amplification kicks in. Edge routers experience heavy packet loss (64%) and gateway timeout surges.'
      },
      {
        step: 'T + 30 min',
        timeOffset: '+30 min',
        stage: 'Cascading Service Degradation',
        simpleStage: '4. System Freezing for Real Users',
        riskLevel: 'Critical',
        riskScore: 98,
        simpleSynRatio: '28x persistent flood',
        synRatio: '28.1x baseline',
        simplePacketRate: '1.20 Million requests / sec',
        packetRate: '1,200,000 pps',
        simpleBandwidth: '11.0 Gbps (Saturated)',
        bandwidth: '11.0 Gbps',
        simpleCpuImpact: '95% CPU Lock',
        cpuImpact: '95% CPU',
        simpleStateDesc: 'Internal databases and login services crash because the front gate is jammed.',
        stateDesc: 'Downstream microservices fail health checks. Ingress failover circuit breakers trip, causing user-facing outage.'
      },
      {
        step: 'T + 60 min',
        timeOffset: '+60 min',
        stage: 'Prolonged Outage / Resource Lock',
        simpleStage: '5. Total System Blackout',
        riskLevel: 'Critical',
        riskScore: 94,
        simpleSynRatio: '19x continuous flood',
        synRatio: '19.5x baseline',
        simplePacketRate: '850,000 requests / sec',
        packetRate: '850,000 pps',
        simpleBandwidth: '7.8 Gbps (Locked)',
        bandwidth: '7.8 Gbps',
        simpleCpuImpact: '88% CPU',
        cpuImpact: '88% CPU',
        simpleStateDesc: 'Website remains down until manual network scrubbing and IP blocking are applied.',
        stateDesc: 'Persistent attack sustains high noise floor. Recovery requires automated BGP flowspec scrubbing.'
      }
    ],

    // Unmitigated vs Mitigated Trajectory
    riskCurve: [
      { time: 'T-10m', unmitigated: 35, mitigated: 35, baseline: 20 },
      { time: 'T-5m', unmitigated: 52, mitigated: 52, baseline: 20 },
      { time: 'T0 (Now)', unmitigated: 74, mitigated: 74, baseline: 20 },
      { time: 'T+5m', unmitigated: 86, mitigated: 45, baseline: 20 },
      { time: 'T+15m', unmitigated: 96, mitigated: 28, baseline: 20 },
      { time: 'T+30m', unmitigated: 98, mitigated: 22, baseline: 20 },
      { time: 'T+45m', unmitigated: 96, mitigated: 18, baseline: 20 },
      { time: 'T+60m', unmitigated: 94, mitigated: 16, baseline: 20 },
    ],

    vectorProbabilities: [
      { name: 'Server Flood (SYN Flood)', probability: 96.4, color: '#ef4444' },
      { name: 'Amplified Traffic (UDP)', probability: 78.2, color: '#f97316' },
      { name: 'Slow Jam (Slowloris)', probability: 24.1, color: '#f59e0b' },
      { name: 'Secret Tunneling (DNS)', probability: 12.3, color: '#10b981' }
    ],

    // Simple vs Technical Metrics
    metrics: {
      ingressRate: '4.6 Gbps',
      simpleIngress: '4.6 Gigabits/s (Heavy Traffic)',
      packetRate: '412,890 pps',
      simplePacketRate: '412,890 packets per second',
      anomalyIndex: '8.92 / 10',
      simpleAnomaly: '8.9 / 10 (Extremely Unusual)',
      synAckRatio: '14.2 : 1',
      simpleSynRatio: '14x Fake Requests vs Real',
      connectionChurn: '+340%',
      simpleChurn: '340% increase in sudden connections',
      flowDurationMean: '0.12s',
      simpleDuration: 'Instant (0.12 sec) — disconnects immediately'
    },

    explainability: {
      cisoSummary: 'The AI model noticed that for every normal user connecting, there are 14 fake connection attempts from suspicious computers that immediately disappear. If we do not automatically block these fake connections, our server memory will run out in 15 minutes.',
      topShapFeatures: [
        { feature: 'Fake Connection Ratio (SYN/ACK)', importance: 0.38, impact: 'positive', description: '14x higher than normal daily traffic' },
        { feature: 'Ultra-Fast Arrival Rate', importance: 0.26, impact: 'positive', description: 'Packets arriving every 0.002 milliseconds' },
        { feature: 'Single Target Lock', importance: 0.18, impact: 'positive', description: 'All attack traffic is aimed at the same front door' },
        { feature: 'Total Data Volume', importance: 0.12, impact: 'positive', description: 'Sudden spike in incoming network bandwidth' }
      ],
      rulesViolated: [
        'Fake Connection Memory Flooding Detected (SYN Flood Pattern)',
        'Incoming Traffic 3.8x Above Normal Statistical Baseline',
        'Known High-Risk Botnet Computers Identified'
      ],
      mitigationRecommendation: 'Turn on automatic fake request filtering, limit fast requests to 20k/s, and block the flagged botnet computers.',
      techMitigation: 'Deploy SYN Cookies, rate-limit ingress TCP on Edge Firewall to 20k pps, and apply BGP Flowspec rule to filter source ASNs 208323 & 44034.'
    }
  },

  {
    id: 'slowloris-attack',
    title: 'Slowloris HTTP Connection Thread Exhaustion',
    simpleTitle: 'Stealth Connection Holding Attack (Slowloris)',
    shortName: 'Slowloris HTTP',
    simpleShortName: 'Slowloris Slow-Jam',
    severity: 'Elevated',
    riskScore: 78,
    confidence: 89.2,
    horizon: 'T + 30 min',
    simpleHorizon: 'Danger in 30 mins',
    
    simpleSummary: 'Attackers are opening thousands of connections and deliberately holding them open very slowly. Even though traffic volume looks small, our web server will run out of available connection slots in 30 minutes.',
    summary: 'AI model detects subtle thread exhaustion via slow header transmission. Volumetrics appear low/normal, but connection hold duration exceeds 180 seconds, forecasting Apache/NGINX pool exhaustion in 28 minutes.',
    
    predictedAttack: 'Slowloris HTTP Connection Thread Exhaustion',
    simpleAttack: 'Low-and-Slow Web Server Jam (Slowloris)',
    
    primaryVector: 'Low-and-Slow Incomplete HTTP Headers',
    simplePrimaryVector: 'Opening connections and never finishing them',
    
    secondaryVector: 'Keep-Alive Header Timeout Holding',
    simpleSecondaryVector: 'Holding web server slots open with tiny 1-byte trickles',
    
    targetAssets: ['Web Frontend 10.0.2.15', 'NGINX Reverse Proxy Pool', 'Customer Portal'],
    simpleTargetAssets: ['Customer Portal Server (10.0.2.15)', 'Web Load Balancers'],
    
    attackerProfiles: [
      {
        ip: '103.114.160.22',
        asn: 'AS133199 (Broadband)',
        country: 'India 🇮🇳',
        threatScore: 82,
        simpleDesc: 'Slow-connection holding machine',
        techDetails: 'Slowloris Worker • 1,200 open sockets with 180s duration'
      },
      {
        ip: '179.43.149.77',
        asn: 'AS51852 (Private Layer)',
        country: 'Panama 🇵🇦',
        threatScore: 79,
        simpleDesc: 'Periodic socket keep-alive sender',
        techDetails: 'Incomplete HTTP Header stream • 1-byte periodic intervals'
      }
    ],

    timeline: [
      {
        step: 'T0 (Current)',
        timeOffset: 'Now',
        stage: 'Stealth Connection Seeding',
        simpleStage: '1. Secretly Opening Slow Connections',
        riskLevel: 'Warning',
        riskScore: 58,
        simpleSynRatio: 'Normal 1:1 ratio',
        synRatio: '1.2x baseline',
        simplePacketRate: '8,400 requests / sec',
        packetRate: '8,400 pps',
        simpleBandwidth: '45 Mbps (Low bandwidth disguises attack)',
        bandwidth: '45 Mbps',
        simpleCpuImpact: 'Normal 28% load',
        cpuImpact: '28%',
        simpleStateDesc: '1,200 slow connections opened. Bandwidth looks normal, but server slots are quietly filling up.',
        stateDesc: '1,200 persistent HTTP GET connections opened with partial headers. Flow duration climbing rapidly.'
      },
      {
        step: 'T + 5 min',
        timeOffset: '+5 min',
        stage: 'Worker Thread Contention',
        simpleStage: '2. Server Slots 62% Occupied',
        riskLevel: 'Elevated',
        riskScore: 72,
        simpleSynRatio: 'Normal',
        synRatio: '1.3x baseline',
        simplePacketRate: '11,200 requests / sec',
        packetRate: '11,200 pps',
        simpleBandwidth: '58 Mbps',
        bandwidth: '58 Mbps',
        simpleCpuImpact: '45% load',
        cpuImpact: '45%',
        simpleStateDesc: 'Web server connection slots are 62% taken. New customer logins experience 2-second delay.',
        stateDesc: 'Web server worker thread occupancy reaches 62%. New incoming client requests experience 1.8s latency.'
      },
      {
        step: 'T + 15 min',
        timeOffset: '+15 min',
        stage: 'Worker Pool Saturation',
        simpleStage: '3. Slots 88% Full (Serious Lag)',
        riskLevel: 'Elevated',
        riskScore: 82,
        simpleSynRatio: 'Normal',
        synRatio: '1.4x baseline',
        simplePacketRate: '14,500 requests / sec',
        packetRate: '14,500 pps',
        simpleBandwidth: '68 Mbps',
        bandwidth: '68 Mbps',
        simpleCpuImpact: '64% load',
        cpuImpact: '64%',
        simpleStateDesc: 'Connection table is almost full. The attacker sends 1 byte every 10 seconds to keep slots locked.',
        stateDesc: 'Connection table hits 88% capacity. Keep-alive timeouts held open with periodic 1-byte header packets.'
      },
      {
        step: 'T + 30 min',
        timeOffset: '+30 min',
        stage: 'Complete HTTP Starvation',
        simpleStage: '4. Server Maxed Out (504 Gateway Error)',
        riskLevel: 'Critical',
        riskScore: 88,
        simpleSynRatio: 'Normal',
        synRatio: '1.5x baseline',
        simplePacketRate: '16,000 requests / sec',
        packetRate: '16,000 pps',
        simpleBandwidth: '75 Mbps',
        bandwidth: '75 Mbps',
        simpleCpuImpact: '72% load',
        cpuImpact: '72%',
        simpleStateDesc: 'Zero slots left for real users. The website shows "504 Gateway Timeout" despite low internet usage.',
        stateDesc: 'MaxClients limit reached. Legitimate web users receive HTTP 504 Gateway Timeout errors.'
      },
      {
        step: 'T + 60 min',
        timeOffset: '+60 min',
        stage: 'System Stagnation',
        simpleStage: '5. Web Server Completely Frozen',
        riskLevel: 'Elevated',
        riskScore: 79,
        simpleSynRatio: 'Normal',
        synRatio: '1.4x baseline',
        simplePacketRate: '15,000 requests / sec',
        packetRate: '15,000 pps',
        simpleBandwidth: '70 Mbps',
        bandwidth: '70 Mbps',
        simpleCpuImpact: '68% load',
        cpuImpact: '68%',
        simpleStateDesc: 'Server remains unresponsive to new connections despite negligible network bandwidth consumption.',
        stateDesc: 'Server remains unresponsive to new connections despite negligible network bandwidth consumption.'
      }
    ],

    riskCurve: [
      { time: 'T-10m', unmitigated: 25, mitigated: 25, baseline: 18 },
      { time: 'T-5m', unmitigated: 42, mitigated: 42, baseline: 18 },
      { time: 'T0 (Now)', unmitigated: 58, mitigated: 58, baseline: 18 },
      { time: 'T+5m', unmitigated: 72, mitigated: 40, baseline: 18 },
      { time: 'T+15m', unmitigated: 82, mitigated: 25, baseline: 18 },
      { time: 'T+30m', unmitigated: 88, mitigated: 19, baseline: 18 },
      { time: 'T+45m', unmitigated: 84, mitigated: 18, baseline: 18 },
      { time: 'T+60m', unmitigated: 79, mitigated: 17, baseline: 18 },
    ],

    vectorProbabilities: [
      { name: 'Slowloris (Slow-Jam)', probability: 89.2, color: '#f97316' },
      { name: 'Slow POST Upload', probability: 64.8, color: '#f59e0b' },
      { name: 'Server Flood', probability: 14.5, color: '#ef4444' },
      { name: 'Password Brute Force', probability: 8.1, color: '#10b981' }
    ],

    metrics: {
      ingressRate: '58 Mbps',
      simpleIngress: '58 Mbps (Low Traffic Disguise)',
      packetRate: '11,200 pps',
      simplePacketRate: '11,200 packets per second',
      anomalyIndex: '6.45 / 10',
      simpleAnomaly: '6.5 / 10 (Unusual Connection Length)',
      synAckRatio: '1.2 : 1',
      simpleSynRatio: 'Normal 1:1 Request Ratio',
      connectionChurn: '+18%',
      simpleChurn: 'Low Churn (Connections Held Frozen)',
      flowDurationMean: '184.2s',
      simpleDuration: 'Super Long (184s vs normal 1.4s)'
    },

    explainability: {
      cisoSummary: 'Old-school firewalls miss this attack because bandwidth is very small (under 60 Mbps). But our AI noticed that connections are staying open 130 times longer than normal (184 seconds instead of 1.4 seconds) without ever finishing.',
      topShapFeatures: [
        { feature: 'Abnormal Connection Lifetime', importance: 0.44, impact: 'positive', description: 'Held open 130x longer than legitimate web requests' },
        { feature: 'Tiny 1-Byte Keep-Alive Tricks', importance: 0.22, impact: 'positive', description: 'Sending tiny 1-byte packets to prevent timeout' },
        { feature: 'Long Pauses Between Data', importance: 0.19, impact: 'positive', description: 'Pausing 15+ seconds between request lines' }
      ],
      rulesViolated: [
        'Web Socket Held Open > 120 Seconds Without Completing',
        'Incomplete Request Rate > 92% from Flagged IPs'
      ],
      mitigationRecommendation: 'Shorten web server waiting time to 5 seconds and limit maximum open connections per user.',
      techMitigation: 'Configure aggressive HTTP header timeout in NGINX (client_header_timeout 5s) and enforce connection limits per IP (limit_conn_zone).'
    }
  },

  {
    id: 'apt-recon-scan',
    title: 'Distributed Port Sweep & Lateral Service Enumeration',
    simpleTitle: 'Sneaky Network Scouting & Port Probing (Hacker Recon)',
    shortName: 'APT Port Scan',
    simpleShortName: 'Hacker Recon Scan',
    severity: 'Warning',
    riskScore: 54,
    confidence: 91.5,
    horizon: 'T + 60 min',
    simpleHorizon: 'Danger in 60 mins',
    
    simpleSummary: 'A suspicious external computer is quietly testing all open doors (ports) on our internal office servers one by one to find an unlocked door before attempting a full break-in within 45 to 60 minutes.',
    summary: 'Temporal sequence model identifies slow randomized port enumeration across 254 subnet hosts. Forecast indicates imminent targeted exploit attempt on discovered open vulnerability in 45-60 minutes.',
    
    predictedAttack: 'Distributed Port Sweep & Lateral Service Enumeration',
    simpleAttack: 'Network Port Scanning & Hacker Scouting',
    
    primaryVector: 'Stealth SYN/FIN Scanning (Nmap decoys)',
    simplePrimaryVector: 'Checking open ports across the entire network',
    
    secondaryVector: 'Vulnerability Probing on SSH & RDP',
    simpleSecondaryVector: 'Searching for unpatched software versions',
    
    targetAssets: ['Internal DMZ Subnet 192.168.10.0/24', 'Database Node 192.168.10.45', 'Internal Jumphost'],
    simpleTargetAssets: ['Internal Office Servers (192.168.10.x)', 'Database Node'],
    
    attackerProfiles: [
      {
        ip: '45.33.32.156',
        asn: 'AS63949 (Linode)',
        country: 'United States 🇺🇸',
        threatScore: 78,
        simpleDesc: 'Scouting machine testing 1,400 doors',
        techDetails: 'Port Scanner Probe • 1,400 unique ports probed in 3 minutes'
      }
    ],

    timeline: [
      {
        step: 'T0 (Current)',
        timeOffset: 'Now',
        stage: 'Stealth Port Sweep',
        simpleStage: '1. Testing 1,400 Doors (Port Sweep)',
        riskLevel: 'Warning',
        riskScore: 54,
        simpleSynRatio: '2x higher than normal',
        synRatio: '2.1x baseline',
        simplePacketRate: '3,200 requests / sec',
        packetRate: '3,200 pps',
        simpleBandwidth: '12 Mbps (Very Low Noise)',
        bandwidth: '12 Mbps',
        simpleCpuImpact: 'Normal 18% load',
        cpuImpact: '18%',
        simpleStateDesc: 'Attacker is probing non-standard doors (ports 8080, 9200, 27017) using random delays.',
        stateDesc: 'Slow sweep of non-standard ports (8080, 8443, 9200, 27017) using randomized inter-packet delays.'
      },
      {
        step: 'T + 5 min',
        timeOffset: '+5 min',
        stage: 'Service Banner Grabbing',
        simpleStage: '2. Identifying Software Versions',
        riskLevel: 'Warning',
        riskScore: 61,
        simpleSynRatio: '2.4x baseline',
        synRatio: '2.4x baseline',
        simplePacketRate: '4,100 requests / sec',
        packetRate: '4,100 pps',
        simpleBandwidth: '18 Mbps',
        bandwidth: '18 Mbps',
        simpleCpuImpact: '22% load',
        cpuImpact: '22%',
        simpleStateDesc: 'Attacker tests identified open ports to see what software versions we are running.',
        stateDesc: 'Automated probing of identified live ports to capture software versions and OS fingerprint.'
      },
      {
        step: 'T + 15 min',
        timeOffset: '+15 min',
        stage: 'Target Selection & CVE Match',
        simpleStage: '3. Found an Unpatched Database Port',
        riskLevel: 'Elevated',
        riskScore: 69,
        simpleSynRatio: '2.8x baseline',
        synRatio: '2.8x baseline',
        simplePacketRate: '5,800 requests / sec',
        packetRate: '5,800 pps',
        simpleBandwidth: '24 Mbps',
        bandwidth: '24 Mbps',
        simpleCpuImpact: '29% load',
        cpuImpact: '29%',
        simpleStateDesc: 'Attacker discovers an old Elasticsearch database port (9200) that has not been updated.',
        stateDesc: 'Identified unpatched Elasticsearch 7.x service on internal node 192.168.10.45:9200.'
      },
      {
        step: 'T + 30 min',
        timeOffset: '+30 min',
        stage: 'Exploit Payload Delivery Probe',
        simpleStage: '4. Preparing Exploit Code to Break In',
        riskLevel: 'Elevated',
        riskScore: 78,
        simpleSynRatio: '3.2x baseline',
        synRatio: '3.2x baseline',
        simplePacketRate: '7,200 requests / sec',
        packetRate: '7,200 pps',
        simpleBandwidth: '31 Mbps',
        bandwidth: '31 Mbps',
        simpleCpuImpact: '35% load',
        cpuImpact: '35%',
        simpleStateDesc: 'Attacker loads automated exploit code designed to hack into the unpatched database.',
        stateDesc: 'Attacker loads proof-of-concept RCE exploit payloads targeting identified CVE.'
      },
      {
        step: 'T + 60 min',
        timeOffset: '+60 min',
        stage: 'Lateral Pivot & Privilege Escalation',
        simpleStage: '5. Breaking into Other Office Computers',
        riskLevel: 'Critical',
        riskScore: 89,
        simpleSynRatio: '4.5x baseline',
        synRatio: '4.5x baseline',
        simplePacketRate: '12,000 requests / sec',
        packetRate: '12,000 pps',
        simpleBandwidth: '48 Mbps',
        bandwidth: '48 Mbps',
        simpleCpuImpact: '52% load',
        cpuImpact: '52%',
        simpleStateDesc: 'If not blocked, the hacker will jump from the database to all other office computers.',
        stateDesc: 'Forecasting predicts lateral compromise of secondary database node if DMZ firewall rules are not updated.'
      }
    ],

    riskCurve: [
      { time: 'T-10m', unmitigated: 20, mitigated: 20, baseline: 15 },
      { time: 'T-5m', unmitigated: 38, mitigated: 38, baseline: 15 },
      { time: 'T0 (Now)', unmitigated: 54, mitigated: 54, baseline: 15 },
      { time: 'T+5m', unmitigated: 61, mitigated: 32, baseline: 15 },
      { time: 'T+15m', unmitigated: 69, mitigated: 22, baseline: 15 },
      { time: 'T+30m', unmitigated: 78, mitigated: 18, baseline: 15 },
      { time: 'T+45m', unmitigated: 84, mitigated: 16, baseline: 15 },
      { time: 'T+60m', unmitigated: 89, mitigated: 15, baseline: 15 },
    ],

    vectorProbabilities: [
      { name: 'Port Scouting & Recon', probability: 91.5, color: '#f59e0b' },
      { name: 'Software Exploit Probe', probability: 72.4, color: '#f97316' },
      { name: 'Password Guessing', probability: 41.0, color: '#ef4444' },
      { name: 'Normal Traffic', probability: 8.5, color: '#10b981' }
    ],

    metrics: {
      ingressRate: '18 Mbps',
      simpleIngress: '18 Mbps (Stealthy Low Noise)',
      packetRate: '4,100 pps',
      simplePacketRate: '4,100 packets per second',
      anomalyIndex: '4.82 / 10',
      simpleAnomaly: '4.8 / 10 (Suspicious Door Checking)',
      synAckRatio: '2.4 : 1',
      simpleSynRatio: '2x More Unanswered Probes',
      connectionChurn: '+85%',
      simpleChurn: '85% increase in port tests',
      flowDurationMean: '0.04s',
      simpleDuration: 'Rapid Knock-and-Run (0.04s)'
    },

    explainability: {
      cisoSummary: 'The AI detected a single computer outside our office trying to knock on over 1,400 different software ports in under 3 minutes. This matches standard hacker scouting (MITRE T1046) before an attempted break-in.',
      topShapFeatures: [
        { feature: 'Knocking on 1,400+ Different Ports', importance: 0.35, impact: 'positive', description: 'Testing non-standard ports (8080, 9200, 27017)' },
        { feature: 'Disconnecting Immediately', importance: 0.28, impact: 'positive', description: 'Knocking without sending real data' },
        { feature: 'Scanning Multiple Adjacent Computers', importance: 0.21, impact: 'positive', description: 'Targeting IP addresses in sequence' }
      ],
      rulesViolated: [
        'MITRE ATT&CK T1046 Network Service Discovery Match',
        'Port Scan Threshold Exceeded (>150 ports probed / min)'
      ],
      mitigationRecommendation: 'Block the scouting computer IP (45.33.32.156) and isolate database node 192.168.10.45.',
      techMitigation: 'Isolate DMZ node 192.168.10.45, drop inbound traffic from 45.33.32.156, and enable port scan auto-quarantine on boundary firewall.'
    }
  },

  {
    id: 'ransomware-c2',
    title: 'Encrypted C2 Channel & Multi-Part Data Exfiltration',
    simpleTitle: 'Secret Hacker Contact & Data Theft (Ransomware C2)',
    shortName: 'Ransomware C2',
    simpleShortName: 'Ransomware C2 Contact',
    severity: 'Critical',
    riskScore: 95,
    confidence: 97.8,
    horizon: 'T + 5 min',
    simpleHorizon: 'Danger in 5 mins',
    
    simpleSummary: 'An infected office computer is secretly sending regular "heartbeat" signals to a known foreign criminal server. The AI predicts they are about to steal files and lock down systems in 5 minutes.',
    summary: 'AI sequence analyzer detects strict periodic jitter in outbound TLS beacons matching Cobalt Strike / LockBit C2 profiles. Model forecasts active bulk exfiltration and ransomware staging within 5 to 10 minutes.',
    
    predictedAttack: 'Encrypted C2 Channel & Multi-Part Data Exfiltration',
    simpleAttack: 'Secret Criminal Server Contact & Data Theft',
    
    primaryVector: 'DNS Tunneling & TLS SNI Spoofing',
    simplePrimaryVector: 'Secret encrypted channel to criminal server',
    
    secondaryVector: 'Staged Database Dumps via HTTPS Outbound',
    simpleSecondaryVector: 'Stealing financial databases before encrypting files',
    
    targetAssets: ['Financial DB Server 172.16.5.88', 'Domain Controller AD-01', 'Core Storage SAN'],
    simpleTargetAssets: ['Financial Database (172.16.5.88)', 'Main Company Controller'],
    
    attackerProfiles: [
      {
        ip: '91.240.118.172',
        asn: 'AS202425 (Hostkey)',
        country: 'Netherlands 🇳🇱',
        threatScore: 99,
        simpleDesc: 'Known ransomware master server',
        techDetails: 'Cobalt Strike C2 Server • 45.0s heartbeat beacon with <2% jitter'
      }
    ],

    timeline: [
      {
        step: 'T0 (Current)',
        timeOffset: 'Now',
        stage: 'Heartbeat C2 Beaconing',
        simpleStage: '1. Secret 45-Second Heartbeat Signal',
        riskLevel: 'Elevated',
        riskScore: 84,
        simpleSynRatio: 'Normal',
        synRatio: '1.1x baseline',
        simplePacketRate: '15,600 requests / sec',
        packetRate: '15,600 pps',
        simpleBandwidth: '120 Mbps (Outbound Egress)',
        bandwidth: '120 Mbps',
        simpleCpuImpact: '35% load',
        cpuImpact: '35%',
        simpleStateDesc: 'An internal computer is secretly phoning home to a criminal server every 45.0 seconds.',
        stateDesc: 'Strict 45.0s (+/- 2% jitter) encrypted heartbeat beacons transmitting system metadata to foreign IP.'
      },
      {
        step: 'T + 5 min',
        timeOffset: '+5 min',
        stage: 'C2 Tasking & Key Exchange',
        simpleStage: '2. Hacker Sends Attack Command',
        riskLevel: 'Critical',
        riskScore: 95,
        simpleSynRatio: 'Normal',
        synRatio: '1.2x baseline',
        simplePacketRate: '28,000 requests / sec',
        packetRate: '28,000 pps',
        simpleBandwidth: '380 Mbps (Egress Surging)',
        bandwidth: '380 Mbps',
        simpleCpuImpact: '58% load',
        cpuImpact: '58%',
        simpleStateDesc: 'Criminal server responds with encryption instructions and prepares to steal files.',
        stateDesc: 'Attacker sends encryption instruction payload. Secondary staging server starts querying Active Directory.'
      },
      {
        step: 'T + 15 min',
        timeOffset: '+15 min',
        stage: 'Bulk Exfiltration In Progress',
        simpleStage: '3. Stealing 45 GB of Private Files',
        riskLevel: 'Critical',
        riskScore: 99,
        simpleSynRatio: '1.4x baseline',
        synRatio: '1.4x baseline',
        simplePacketRate: '95,000 requests / sec',
        packetRate: '95,000 pps',
        simpleBandwidth: '1.4 Gbps (High-Speed Upload)',
        bandwidth: '1.4 Gbps',
        simpleCpuImpact: '82% load',
        cpuImpact: '82%',
        simpleStateDesc: 'High-speed upload is actively sending customer financial records to a foreign server.',
        stateDesc: 'High-speed outbound egress stream transmitting 45 GB of customer financial archives to bulletproof hosting.'
      },
      {
        step: 'T + 30 min',
        timeOffset: '+30 min',
        stage: 'Payload Encryption Trigger',
        simpleStage: '4. Encrypting Company Files (Ransomware)',
        riskLevel: 'Critical',
        riskScore: 100,
        simpleSynRatio: '2.1x baseline',
        synRatio: '2.1x baseline',
        simplePacketRate: '120,000 requests / sec',
        packetRate: '120,000 pps',
        simpleBandwidth: '900 Mbps',
        bandwidth: '900 Mbps',
        simpleCpuImpact: '98% (CPU Maxed Out)',
        cpuImpact: '98%',
        simpleStateDesc: 'Ransomware locks all internal files and displays ransom note on screens.',
        stateDesc: 'LockBit payload executes across internal shares. Shadow copies deleted; ransomware notes dropped.'
      },
      {
        step: 'T + 60 min',
        timeOffset: '+60 min',
        stage: 'Total Enterprise Lockdown',
        simpleStage: '5. Total Office Lockdown',
        riskLevel: 'Critical',
        riskScore: 98,
        simpleSynRatio: '1.8x baseline',
        synRatio: '1.8x baseline',
        simplePacketRate: '40,000 requests / sec',
        packetRate: '40,000 pps',
        simpleBandwidth: '200 Mbps',
        bandwidth: '200 Mbps',
        simpleCpuImpact: '85% load',
        cpuImpact: '85%',
        simpleStateDesc: 'All company systems locked. Recovery requires offline backups.',
        stateDesc: 'Complete domain lockout. Recovery requires offline immutable backups.'
      }
    ],

    riskCurve: [
      { time: 'T-10m', unmitigated: 45, mitigated: 45, baseline: 15 },
      { time: 'T-5m', unmitigated: 68, mitigated: 68, baseline: 15 },
      { time: 'T0 (Now)', unmitigated: 84, mitigated: 84, baseline: 15 },
      { time: 'T+5m', unmitigated: 95, mitigated: 35, baseline: 15 },
      { time: 'T+15m', unmitigated: 99, mitigated: 22, baseline: 15 },
      { time: 'T+30m', unmitigated: 100, mitigated: 16, baseline: 15 },
      { time: 'T+45m', unmitigated: 98, mitigated: 15, baseline: 15 },
      { time: 'T+60m', unmitigated: 98, mitigated: 14, baseline: 15 },
    ],

    vectorProbabilities: [
      { name: 'Secret Hacker Contact (C2)', probability: 97.8, color: '#ef4444' },
      { name: 'Ransomware File Lock', probability: 93.4, color: '#f97316' },
      { name: 'Secret Tunneling (DNS)', probability: 81.2, color: '#f59e0b' },
      { name: 'Normal Browsing', probability: 2.2, color: '#10b981' }
    ],

    metrics: {
      ingressRate: '45 Mbps',
      simpleIngress: '45 Mbps Inbound',
      packetRate: '28,000 pps',
      simplePacketRate: '28,000 packets per second',
      anomalyIndex: '9.64 / 10',
      simpleAnomaly: '9.6 / 10 (Extreme Danger)',
      synAckRatio: '1.2 : 1',
      simpleSynRatio: 'Normal 1:1 Request Ratio',
      connectionChurn: '+190%',
      simpleChurn: '190% jump in upload traffic',
      flowDurationMean: '45.0s',
      simpleDuration: 'Clockwork Signals Every 45 Sec'
    },

    explainability: {
      cisoSummary: 'The AI detected an internal office computer talking to a known criminal server in the Netherlands at exact 45-second intervals. Encrypted data is already being prepared for upload. Immediate containment is required.',
      topShapFeatures: [
        { feature: 'Exact 45-Second Signal Heartbeat', importance: 0.42, impact: 'positive', description: 'Machine phoning home on clockwork timer' },
        { feature: 'Encrypted Scrambled Data Upload', importance: 0.31, impact: 'positive', description: 'Sending encrypted archives out of office' },
        { feature: 'High Upload vs Download Ratio', importance: 0.22, impact: 'positive', description: 'Uploading 8x more data than a normal worker' }
      ],
      rulesViolated: [
        'MITRE ATT&CK T1071 Application Layer C2 Beacon Detected',
        'Abnormal Outbound Data Upload on Financial Database Computer',
        'Known Criminal Server IP (91.240.118.172) Contacted'
      ],
      mitigationRecommendation: 'IMMEDIATE ACTION: Disconnect the infected financial database computer from the internet and isolate it.',
      techMitigation: 'IMMEDIATE ACTION: Sever external gateway connection to 91.240.118.172, isolate DB host 172.16.5.88 via EDR containment, and revoke Kerberos golden tickets.'
    }
  },

  {
    id: 'normal-baseline',
    title: 'Normal Enterprise Baseline Traffic',
    simpleTitle: 'Healthy Normal Operations (No Threats)',
    shortName: 'Safe Baseline',
    simpleShortName: 'All Safe & Normal',
    severity: 'Safe',
    riskScore: 14,
    confidence: 99.1,
    horizon: 'Stable',
    simpleHorizon: 'All Clear (Stable)',
    
    simpleSummary: 'All network traffic is safe and operating within normal daily boundaries. Real users are browsing and logging in smoothly with zero security alarms.',
    summary: 'Network telemetry is completely within 1-sigma historical baseline. Flow inter-arrival rates, packet entropy, and handshake completion ratios reflect healthy enterprise operations.',
    
    predictedAttack: 'No Attack Forecasted (Nominal Network State)',
    simpleAttack: 'Normal Business Operations (Safe)',
    
    primaryVector: 'Standard HTTPS / DNS / Internal Microservice Mesh',
    simplePrimaryVector: 'Regular website browsing and database queries',
    
    secondaryVector: 'Scheduled Database Backup Sync',
    simpleSecondaryVector: 'Scheduled routine system backups',
    
    targetAssets: ['All Enterprise Services Operational', 'Zero Degraded Nodes'],
    simpleTargetAssets: ['All 100+ Office Servers Healthy', 'Zero Issues'],
    
    attackerProfiles: [],

    timeline: [
      {
        step: 'T0 (Current)',
        timeOffset: 'Now',
        stage: 'Nominal Operations',
        simpleStage: '1. Smooth Daily Operations',
        riskLevel: 'Safe',
        riskScore: 14,
        simpleSynRatio: 'Balanced 1:1',
        synRatio: '1.0x baseline',
        simplePacketRate: '14,200 requests / sec',
        packetRate: '14,200 pps',
        simpleBandwidth: '340 Mbps (Normal Traffic)',
        bandwidth: '340 Mbps',
        simpleCpuImpact: 'Relaxed 18% load',
        cpuImpact: '18%',
        simpleStateDesc: 'Standard website visitors browsing and logging in smoothly.',
        stateDesc: 'Balanced traffic distribution across internal load balancers and Kubernetes ingress controllers.'
      },
      {
        step: 'T + 5 min',
        timeOffset: '+5 min',
        stage: 'Nominal Operations',
        simpleStage: '2. Smooth Daily Operations',
        riskLevel: 'Safe',
        riskScore: 15,
        simpleSynRatio: 'Balanced 1:1',
        synRatio: '1.0x baseline',
        simplePacketRate: '15,100 requests / sec',
        packetRate: '15,100 pps',
        simpleBandwidth: '360 Mbps',
        bandwidth: '360 Mbps',
        simpleCpuImpact: '19% load',
        cpuImpact: '19%',
        simpleStateDesc: 'Standard user access patterns and scheduled database queries.',
        stateDesc: 'Standard user access patterns and scheduled database read replica queries.'
      },
      {
        step: 'T + 15 min',
        timeOffset: '+15 min',
        stage: 'Nominal Operations',
        simpleStage: '3. Smooth Daily Operations',
        riskLevel: 'Safe',
        riskScore: 14,
        simpleSynRatio: 'Balanced 1:1',
        synRatio: '1.0x baseline',
        simplePacketRate: '14,800 requests / sec',
        packetRate: '14,800 pps',
        simpleBandwidth: '350 Mbps',
        bandwidth: '350 Mbps',
        simpleCpuImpact: '18% load',
        cpuImpact: '18%',
        simpleStateDesc: 'Predictive model forecasts stable, non-anomalous network telemetry.',
        stateDesc: 'Predictive model forecasts stable, non-anomalous network telemetry.'
      },
      {
        step: 'T + 30 min',
        timeOffset: '+30 min',
        stage: 'Nominal Operations',
        simpleStage: '4. Smooth Daily Operations',
        riskLevel: 'Safe',
        riskScore: 13,
        simpleSynRatio: 'Balanced 1:1',
        synRatio: '1.0x baseline',
        simplePacketRate: '14,000 requests / sec',
        packetRate: '14,000 pps',
        simpleBandwidth: '330 Mbps',
        bandwidth: '330 Mbps',
        simpleCpuImpact: '17% load',
        cpuImpact: '17%',
        simpleStateDesc: 'Zero security threshold violations; firewall state tables remain healthy.',
        stateDesc: 'Zero security threshold violations; firewall state tables remain healthy.'
      },
      {
        step: 'T + 60 min',
        timeOffset: '+60 min',
        stage: 'Nominal Operations',
        simpleStage: '5. Smooth Daily Operations',
        riskLevel: 'Safe',
        riskScore: 14,
        simpleSynRatio: 'Balanced 1:1',
        synRatio: '1.0x baseline',
        simplePacketRate: '14,500 requests / sec',
        packetRate: '14,500 pps',
        simpleBandwidth: '345 Mbps',
        bandwidth: '345 Mbps',
        simpleCpuImpact: '18% load',
        cpuImpact: '18%',
        simpleStateDesc: 'System health index at 99.8%. No automated intervention required.',
        stateDesc: 'System health index at 99.8%. No automated intervention required.'
      }
    ],

    riskCurve: [
      { time: 'T-10m', unmitigated: 15, mitigated: 15, baseline: 14 },
      { time: 'T-5m', unmitigated: 14, mitigated: 14, baseline: 14 },
      { time: 'T0 (Now)', unmitigated: 14, mitigated: 14, baseline: 14 },
      { time: 'T+5m', unmitigated: 15, mitigated: 15, baseline: 14 },
      { time: 'T+15m', unmitigated: 14, mitigated: 14, baseline: 14 },
      { time: 'T+30m', unmitigated: 13, mitigated: 13, baseline: 14 },
      { time: 'T+45m', unmitigated: 14, mitigated: 14, baseline: 14 },
      { time: 'T+60m', unmitigated: 14, mitigated: 14, baseline: 14 },
    ],

    vectorProbabilities: [
      { name: 'Normal Business Traffic', probability: 99.1, color: '#10b981' },
      { name: 'Harmless Noise', probability: 12.4, color: '#06b6d4' },
      { name: 'Server Flood', probability: 0.8, color: '#ef4444' },
      { name: 'Port Scan', probability: 0.5, color: '#f59e0b' }
    ],

    metrics: {
      ingressRate: '345 Mbps',
      simpleIngress: '345 Mbps (Safe Baseline)',
      packetRate: '14,500 pps',
      simplePacketRate: '14,500 packets per second',
      anomalyIndex: '0.42 / 10',
      simpleAnomaly: '0.4 / 10 (All Clear)',
      synAckRatio: '1.01 : 1',
      simpleSynRatio: 'Perfect 1:1 Healthy Ratio',
      connectionChurn: '+2%',
      simpleChurn: 'Normal Daily Activity',
      flowDurationMean: '2.14s',
      simpleDuration: 'Normal (2.1 seconds per page)'
    },

    explainability: {
      cisoSummary: 'All incoming and outgoing traffic is within normal expected thresholds. Web pages are loading in 2.1 seconds and 99.7% of connections finish cleanly.',
      topShapFeatures: [
        { feature: 'Clean 3-Way Connections Completed', importance: 0.38, impact: 'negative', description: 'Healthy 99.7% connection handshake completion' },
        { feature: 'Normal Web Traffic Variety', importance: 0.25, impact: 'negative', description: 'Standard mix of images, video, and web text' },
        { feature: 'Natural Human Browsing Timing', importance: 0.15, impact: 'negative', description: 'Natural human arrival patterns' }
      ],
      rulesViolated: [],
      mitigationRecommendation: 'No action needed. System is operating normally.',
      techMitigation: 'No action needed. System is operating normally.'
    }
  }
];
