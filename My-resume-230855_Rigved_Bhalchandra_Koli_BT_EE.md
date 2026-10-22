� Rigved Koli _|_ � kolirigved � brigved23@iitk.ac.in 

# **Rigved Bhalchandra Koli** 

Final Year Undergraduate, Dept. of Electrical Engineering, IIT Kanpur 

## **<mark>Academic Qualif</mark> i** **<mark>cations</mark>** 

|**Year**|**Degree/Certificate**|**Institute**|**CPI/**%|
|---|---|---|---|
|2023-Present|B.Tech|Indian Institute of Technology Kanpur|**9.1/10**|
|2023|CBSE(XII)|New Bombay City School, Navi Mumbai|**96.6%**|
|2021|CBSE(X)|DAV Public School, New Panvel|**98.0%**|



## **<mark>Scholastic Achievements</mark>** 

- Demonstrated consistent academic performance, earning **16 highest grades** for Outstanding Performance across coursework at IIT Kanpur. 

- **99.98 Percentile** in **Maharashtra Common Entrance Test MHT CET 2023** among the 5.9 lakh candidates. 

- Scored **328/390 marks** in **BITSAT 2023** , securing admission eligibility across **all BITS campuses** . 

- Achieved a peak rating of **1400** (Specialist) on Codeforces. 

## **<mark>Work Experience</mark>** 

**Google India** _|_ Cloud Compute & Infra Team _|_ Software Engineering Intern _|_ Bengaluru, India 

_(May’26-July’26)_ 

- Developed an end-to-end **observability framework** for a core **resource management system** on top of a **transactional backend service** , implementing continuous service-level monitoring and automated **AI-driven diagnostics** . 

- Configured multi-stage transaction **latency SLOs** using a **declarative configuration framework** , authoring advanced **SQL queries** to reconstruct transaction timelines, calculate **latencies** , and isolate operational bottlenecks. 

- Designed a **continuous tracking mechanism** to monitor active operations, mitigating **outage blindness** by continuously evaluating in-progress transaction states and automating **bug ticket generation** and alerts during critical **system stalls** . 

- Engineered an **AI skill** for **root cause analysis** that parses alerts and executes **SQL queries** to correlate database state with system health, cutting on-call **mean time to diagnose (MTTD)** from 15 minutes to **under 2 minutes** . 

- Onboarded the backend service to a **functional testing framework** , developing **integration tests** covering 5 core APIs. 

- Improved **unit test coverage** on the core service components and successfully diagnosed and fixed a critical **flaky test case** . 

- Recognized with a **Google Peer Bonus** for proactive contributions and strong technical rigor. 

## **<mark>Research Projects</mark>** 

### **AI/ML Based Positioning for 6G-Wireless Systems** _|_ Prof. Rohit Budhiraja _|_ IITK 

### _(Jan’26-Apr’26)_ 

- Developed deep learning models to estimate **Direction-of-Arrival (DoA)** and **Time-of-Arrival (ToA)** for UE localization. 

- Formulated DoA estimation as a discrete classification problem using a hybrid **CNN-Transformer** architecture. 

- Achieved an RMSE of **5.86**<sup>_◦_</sup> for multi-target DoA estimation on a custom dataset with array imperfections at **20 - 30 dB SNR** . 

- Achieved a **68.96% lower angular estimation error** than the classical **MUSIC** algorithm **(18.88**<sup>_◦_</sup> **RMSE)** . 

- Engineered a compact **Soft-Argmax 1D CNN** ( **239K parameters** ) for differentiable first-peak detection on complex CIR, achieving decimeter-level ranging of **0.167 m MAE** . 

- Benchmarked multiple deep learning architectures ( **CNNs, Autoencoders, Transformers** ) across **sample covariance matrices and raw complex snapshots** to optimize estimation accuracy and FLOP efficiency. 

### **Digital Predistortion (DPD) with Gate Bias Compensation** _|_ Prof. Nagaditya Poluri _|_ IITK 

_(May’25-Ongoing)_ 

- Characterize **carrier trapping** in RF Power Amplifiers (PA) using pulsed inputs at multiple power levels. 

- **Objective** • <u>Mitigate nonlinearities and intermodulation products in the amplified signal using compensation techniques.</u> • Extracted **dominant time constants** and their **amplitudes** by fitting exponentials to pulsed I-V data. 

- **Approach** • Designed **Verilog** modules to generate gate compensation voltage on FPGA to offset trap-induced effects. • <u>Created a Simulink-based</u> **<u>adaptive DPD</u>** <u>model and, converted it to Verilog for FPGA implementation.</u> 

- **Results** • Analysed traps at mid–high power levels, estimating **2–4 time constants** with their **amplitudes** per level. • <u>Integrated gate pre-biasing with DPD on</u> **<u>FPGA</u>** <u>, reducing the computational load of real-time PA linearization.</u> 

## **<mark>Key Projects</mark>** 

### **Scribo: Multimodal Knowledge Extraction & Retrieval Engine** _|_ Self Project � 

_(Aug’26)_ 

- Architected a **Next.js 15** and **FastAPI** platform to process lecture recordings and slide decks into structured LaTeX notes, integrating a conversational study assistant powered by **RAG** architecture. 

- Engineered a multimodal ingestion pipeline leveraging **FFmpeg** for audio downsampling, **Whisper STT** for verbatim timestamped transcriptions, **pypdf** for per-page slide extraction with breadcrumb tags, and the **Gemini API** for academic note synthesis and strict grounded generation. 

- Designed a robust retrieval engine using **Hierarchical Chunking** to preserve header and slide-page breadcrumbs, with concurrent batch embeddings via **gemini-embedding-2** for high-throughput indexing. 

- Implemented **Hybrid Search** by fusing dense semantic retrieval ( **ChromaDB** ) with exact sparse lexical matching ( **BM25** ) using **Reciprocal Rank Fusion (RRF)** , significantly improving technical acronym recall. 

- Engineered a **Query Rewriting** module using the **Gemini API** to reformulate ambiguous or abbreviated student queries into semantically enriched retrieval queries, boosting recall for domain-specific academic terminology. 

- Integrated a local **Cross-Encoder** ( **FlashRank** ) to re-score top candidate chunks, filtering hallucination triggers before LLM context injection to provide precise inline citations to audio timestamps and slide numbers. 

### **Travelly: Group Trip Manager** _|_ CS253 Course Project _|_ Prof. Indranil Saha � _(Jan’26-Apr’26)_ 

- Developed a **full-stack group trip management platform** using modular **REST APIs** in **Node.js/Express** , **PostgreSQL/Prisma** data models, and a **Flutter-based frontend** . 

- Built group-scoped expense pipelines supporting **equal and custom split distributions** , **multi-currency balance tracking** , comprehensive reimbursement history, and **UPI payment redirects** . 

- Implemented a **greedy debt-settlement algorithm** using dual **Max-Priority Queues** in _O_ ( _n_ log _n_ ) time to compute net balances and match top debtors with creditors, minimizing cash transfers from _O_ ( _n_<sup>2</sup> ) **to at most** _n −_ 1. 

- Integrated **Firebase Authentication** for secure user login, featuring **server-side token verification** , and strict **authorization checks** across endpoints. 

- Engineered **invite-link-based group joining** with comprehensive member management, including **admin controls** and customizable group settings. 

- Implemented secure server storage as a **document and photo vault** , enabling groups to share and manage **trip-related files** . 

- Integrated route planning tools with **distance-based stop optimization** using **OpenRouteService** and real-time place timing enrichment via the **SerpAPI** for intelligent itinerary planning. 

- Deployed a **real-time notification system** using **Firebase Cloud Messaging (FCM)** to instantly alert group members about new expenses, updates, and deleted transactions. 

### **Parallel Computing** _|_ CS633 Course Assignments _|_ Prof. Preeti Malakar � _(Jan’26-Apr’26)_ 

- Implemented **MPI** -based distributed **3D stencil computation** and **isovalue calculations** using **domain decomposition** . 

- Executed **non-blocking point-to-point halo exchanges** and used **derived datatypes** for deadlock-free boundary transfers, and MPI **collectives** for data aggregation. 

- Profiled execution for **32 to 96** processes and varying input sizes on the **PARAM Rudra** supercomputer cluster to diagnose computation and inter-node communication overhead. 

### **IITK Smart Waste & Bin Overflow Detection** _|_ SignalSprint Hackathon � _(Apr’26)_ 

- Architected a two-stage ML inference pipeline, applying transfer learning to fine-tune **YOLOv11m** for geometric localization of 3 authorized IITK bin types, achieving a **98.4% mAP@50** on a custom captured dataset. 

- Engineered Stage 2 by passing expanded halo-crops through a **5-view Test-Time Augmentation** into a **Swin Transformer** , leveraging **Hierarchical Token Decomposition** to differentiate garbage from natural litter; integrated **Boolean aggregation** to eliminate multi-bin poisoning, achieving _∼_ **82% pipeline accuracy** on the hidden dataset. 

- Curated a **5,700+ image** robust dataset from campus photography and Wikimedia scraping, utilizing **Roboflow** for annotation and geometric augmentations; implemented **active negative mining** , **implicit null-classes** , and a specialized **’trap** **~~o~~ bject’ class** to suppress spatial false-positives and reject **100% of adversarial visual decoys** . 

- Developed a cross-platform **Flutter** mobile application for real-time binary overflow visualization, backed by a **FastAPI** backend handling remote image inference. 

### **ECG BioSignal Amplifier** _|_ EE381: Electrical Engineering Lab-2 � _(Feb’26-Apr’26)_ 

|**Objective**|• Design and route a two-stage analog front-end PCB that acquires clinical ECG signals (0.5–5 mV) while rejecting<br>50 Hz powerline interference|
|---|---|
|**Approach**|• Designed **Stage 1**: a **Twin-T notch filter** with integrated differential gain (series-arm resistors _R_6_/R_7 =<br>13_._6 kΩ, _C_ = 0_._22_µ_F; _Av_ = 3_._35 V/V) to reject 50 Hz interference<br>• Designed **Stage 2**: an **MFB bandpass filter** (_fc ≈_64_._6 Hz) to band-limit the signal to the clinically relevant<br>0.05–150 Hz range<br>• Routed all PCB airwires in Altium Designer (0.75 mm track width), generated Gerber files, and validated the<br>full chain against a live ECG acquisition|
|**Result**|• Achieved **19.3 dB rejection at 50.26 Hz** and a bandpass with _−_3**dB edges at 21.1–172.9 Hz** (centre<br>60.4 Hz), covering all clinically significant ECG features<br>• Acquired a clean ECG waveform resolving **P, QRS and T waves at 61 bpm** (PR = 174 ms, QT = 338 ms),<br>confirming normal sinus rhythm and validating the complete design|



### **Design and Implementation of a Multi-Stage BJT OpAmp** _|_ EE381 Course Project � 

_(Feb’26)_ 

- Designed and simulated a multi-stage **BJT Operational Amplifier** achieving an **open-loop gain of 373.6** and a **unity gain frequency of 458.92 kHz** . 

- Integrated an **intermediate stage** to mitigate loading effects and added a **175 pF compensation capacitor** to stabilize the circuit with a **75.04**<sup>_◦_</sup> **phase margin** . 

- Characterized the amplifier to verify an **input resistance of 127 k** Ω, an **output resistance of 12.65** Ω, and a **slew rate of 0.168 V/** _µ_ **s** ; validated hardware functionality by configuring **inverting and non-inverting setups** . 

**Analog PTAT Temperature Sensor** _|_ EE381 Course Project � 

_(Jan’26)_ 

- Developed an **analog temperature sensor** based on the **Proportional to Absolute Temperature (PTAT)** principle using a **BJT’s base-emitter voltage difference** . 

- Designed a **signal conditioning pipeline** including a **Schmitt oscillator** , a **current switch** , and an **amplifier with a DC blocker** to isolate and amplify the thermal signal. 

- **Implemented the diode-connected BJT** block to function strictly as an **active sensing element** rather than a standard buffer. 

- Achieved a highly linear temperature response with a **measured sensitivity of 1.6223 mV/**<sup>_◦_</sup> **C** and verified performance against a commercial reference sensor through **controlled thermal dissipation testing** . 

### **Audionet** _|_ Electrical Engineering Association, IIT Kanpur � 

_(Dec’24-Jan’25)_ 

- Utilized core audio processing concepts like **Fourier Transform** , **STFT** and **Spectrograms** and audio sampling. 

- Implemented feature extraction methods including **Mel-Spectrograms** , **MFCC** , and **Chromagram** for audio analysis. 

- Built and evaluated **CNN** and **RNN** models for 10-class environmental sound classification, attaining up to **96% F1-Score** . 

- Developed a **Spoof Audio Detection** system using a CNN-LSTM architecture trained on the **ASVspoof 2019** dataset. 

- Classified audio samples as spoof or bonafide, achieving an **87% F1-score** across 19 different spoofing attack types. 

**CamCraft: Vision-Based Game Development** _|_ Mentor _|_ Game Development Club, IIT Kanpur � _(Dec’24)_ 

- Developed a **Unity** game utilizing real-time hand tracking from webcam, mapping hand position and wrist angle to controls. 

- Used **MediaPipe** to recognize and extract the position of **hand and body landmarks** in the webcam frame in real time. 

- Integrated Python–Unity bridge with **socket** to deliver live landmark data via a local server for responsive in-game control. 

**Lost Affinity** _|_ InterIIT Tech Meet 13.0 - IGDC Game Development Challenge _|_ IIT Bombay � _(Dec’24)_ 

- Designed core gameplay mechanics and physics, character interactions, and level progression using **Unity** and **C#** . 

- Ranked overall **7 among 23 IITs** competing in the problem statement and **published** the game on **itch.io** . 

**VisionForge** _|_ Electrical Engineers’ Association, IIT Kanpur � _(Dec’23-Jan’24)_ 

- Simulated and analyzed waveforms of combinational and sequential circuits using **Verilog HDL** and **GTKWave** . 

- Engineered Verilog code for a **Digital Clock** with functionalities like alarm setting, reset and time loading. 

- Implemented a **car parking system** in Verilog, having sensors for vehicle detection, and a password for gate access. 

- Performed image edge detection using **OpenCV** and learned principles of **K-means clustering** for segmentation tasks. 

### **Smart Dustbin** _|_ **TA212 Course Project** _|_ Instructor: Prof. Virkeshwar Kumar 

_(Aug’24-Nov’24)_ 

- Engineered a **movable dustbin** with automated lid and tilt mechanism for **hands-free** , hygienic real-life waste disposal. 

- Integrated **Arduino UNO** with ultrasonic sensors and motor drivers to enable responsive motion and lid automation. 

- Designed mechanical components in **AutoCAD** and fabricated them using **lathe** , **drilling** , and **turning** machines. 

## **<mark>Technical Skills</mark>** 

|**Languages**|**Frameworks & Tools**|**Libraries**|
|---|---|---|
|C, C++, Java, Python, JavaScrip<br>TypeScript, SQL, C#,<br>MATLAB, Verilog HDL|t/<br>Flutter, Node.js, Express,<br>FastAPI, PostgreSQL, Firebase,<br>Docker, Git, Unity, Altium, LTspice,<br>L<sup>A</sup>TEX|Numpy, Pandas, Matplotlib,<br>PyTorch, OpenCV, ChromaDB,<br>Mediapipe, Keras, MPI|
|**Relevant Coursework (Full T**|**ranscript)**|**_* : Ongoing_**|
|Fundamentals of Computing<br>Data Structures and Algorithms<br>Quantum Physics<br>Analog Electronics<br>Introduction To ML*|Probability and Statistics<br>Software Development and Operations<br>Several Variable Calculus<br>Introduction to Electrical Engineering<br>Statistical Signal Processing*|Linear Algebra<br>Parallel Computing<br>Differential Equations<br>Digital Electronics<br>Communication Systems|
|Power Systems<br>Complex Analysis|Electromagnetic Theory<br>Control Systems Analysis|Signals, Systems and Networks<br>Economy, Society & Public Policy|



## **<mark>Positions of Responsibility</mark>** 

**Academic Department Mentor, Academics & Career Council** _(Aug’25-Present)_ 

- Mentored **190+ junior EE students** by providing guidance on academic planning and course selection. 

- Conducted specialized sessions focused on **departmental information** , curriculum structure, and various **career pathways** . 

**Secretary, Game Development Club** _(Jun’24-Apr’25)_ 

- Assisted club heads in organizing major events including **SnT Pavilion** , **Freshers’ Bootcamp** , and **Winter Projects** . 

- Mentored the Winter Project **CamCraft** , guiding students in building a **Unity** Beat Saber-style game controlled via real-time **MediaPipe** hand tracking; integrated a **Python–Unity socket bridge** to stream live hand-landmark data for responsive in-game control. 

- Conducted workshops and lectures for freshers, guiding them in game development using **Unity** and **game art** creation. 

- Collaborated with a **25-member team** to develop and publish games, and represented the club in Game Jams. 

( _Jul’24-May’25_ ) 

**Academic Mentor, Institute Counselling Service** 

- Conducted regular meetings to provide **academic support** to **25+ freshers** in the course **Quantum Physics** . 

- Assisted the Core Team in conduction of **remedial classes** for freshers and organised wing-level **doubt solving sessions** . 

**Secretary, Design and Animation Club** ( _Apr’24-Apr’25_ ) 

- Worked with club heads to **organize workshops** for freshers, introducing design tools such as Figma, Blender, and others. 

- Collaborated with club members to digital artwork, UI/UX design, 3D modeling, and animation for various competitions. 

## **<mark>Extra-Curriculars</mark>** 

- Won the **Best Dataset Award** at the **SignalSprint Hackathon** for creating a **5,700+ image dataset** , organised by the Department of Electrical Engineering and EEA, IIT Kanpur. 

- Led the hall design team to **1st place** in the **Galaxy’25** Brand Design competition by creating a full brand package. 

- Secured **1st place** in **SHARN CTF 2026** (Capture the Flag) competition organized by Programming Club, IIT Kanpur. 

- Secured **2nd place** in **SHARN CTF 2025** (Capture the Flag) competition organized by Programming Club, IIT Kanpur. 

- Won **2nd place** in the **Takneek’24** GeoAR event by developing a campus-based AR game using Niantic Lightship. 

- Secured **1st place** in the **Takneek’24** 3D Modeling On-Spot event by modeling a detailed 3D replica of the Hall 13 building. 

