**Phân loại theo chiến lược và phương pháp tiếp cận (Detection Strategies)**

Trong bối cảnh phát hiện gian lận và dị thường, các mô hình học sâu thường được thiết kế để giải quyết vấn đề dựa trên ba chiến lược cốt lõi:

- **Dựa trên tái tạo (Reconstruction-based):** Các mô hình này được huấn luyện để học sự phân phối và các đặc trưng ẩn của dữ liệu bình thường. Trong quá trình kiểm thử, chúng cố gắng tái tạo lại dữ liệu đầu vào. Những điểm dữ liệu hoặc chuỗi giao dịch tạo ra **lỗi tái tạo (reconstruction error) cao sẽ bị gắn cờ là dị thường** do chúng đi chệch khỏi các mẫu bình thường đã học. Các kiến trúc tiêu biểu bao gồm Autoencoders (AE, VAE), GANs và Diffusion Models. Cách tiếp cận này cực kỳ hiệu quả đối với dữ liệu nhiều chiều và không có nhãn giám sát.
- **Dựa trên dự đoán (Prediction/Forecasting-based):** Sử dụng dữ liệu quá khứ để dự báo các giá trị hoặc sự kiện tiếp theo trong tương lai. Nếu **sự sai lệch (prediction error) giữa giá trị dự đoán và giá trị thực tế vượt quá một ngưỡng nhất định**, một dị thường hoặc hành vi gian lận tiềm ẩn sẽ được xác định. Cách tiếp cận này thường sử dụng Mạng nơ-ron hồi quy (RNN, LSTM, GRU) và Transformer do tính hiệu quả trong việc mô hình hóa các chuỗi thời gian liên tục.
- **Dựa trên đối chiếu và biểu diễn (Contrastive / Representation-based):** Thay vì sử dụng không gian dữ liệu thô, phương pháp này tận dụng học đối chiếu (contrastive learning) để **khai thác các biểu diễn phân biệt** (latent representations) của dữ liệu. Bằng cách tính toán mức độ khác biệt/tương đồng giữa các mẫu, mô hình xác định được sự bất thường, làm cho phương pháp này rất phù hợp khi xử lý chuỗi thời gian đa biến phức tạp.
- **Phương pháp lai (Hybrid Methods):** Tích hợp điểm mạnh của cả việc tái tạo và dự đoán hoặc kết hợp các kiến trúc khác nhau (như CNN và LSTM) nhằm đánh giá toàn diện cả yếu tố không gian lẫn thời gian của dữ liệu, qua đó **nâng cao khả năng phát hiện và giảm tỷ lệ báo động giả** trong các hệ thống gian lận thẻ hoặc giao dịch nội bộ.

**Phân loại theo kiến trúc mạng học sâu (Deep Learning Architectures)**

Các công nghệ nền tảng được chọn để xây dựng mô hình phát hiện gian lận rất đa dạng, tùy thuộc vào định dạng của dữ liệu:

- **Mạng nơ-ron tích chập (CNNs & TCNs):** Ban đầu được sử dụng cho xử lý ảnh, CNNs trong phát hiện gian lận giúp **khai thác các đặc trưng cục bộ và không gian** (chẳng hạn như làm nổi bật thói quen chi tiêu kỳ lạ của thẻ tín dụng). Temporal Convolutional Networks (TCNs) cải tiến thêm qua tích chập giãn để nắm bắt các xu hướng thay đổi dài hạn.
- **Mạng nơ-ron hồi quy (RNNs, LSTM, GRU, BiLSTM):** Thích hợp nhất đối với **dữ liệu giao dịch có tính tuần tự và liên tục**. LSTM và GRU giải quyết tốt vấn đề ghi nhớ thông tin dài hạn, còn BiLSTM phân tích bối cảnh giao dịch từ cả hai hướng (quá khứ và tương lai), giúp hiểu rõ các kỹ thuật gian lận phức tạp.
- **Mô hình tự mã hóa (Autoencoders - AEs, VAEs, CAEs):** Chủ yếu được dùng để **nén dữ liệu đầu vào và phát hiện lỗi tái tạo**. Variational Autoencoders (VAEs) đưa ra biểu diễn không gian ẩn theo xác suất để chống lại nhiễu, trong khi Convolutional Autoencoder (CAE) tối ưu trên dữ liệu dạng ma trận lưới.
- **Mạng đối nghịch sinh (GANs):** Dùng để học mô phỏng phân phối dữ liệu thông qua cuộc cạnh tranh giữa bộ sinh (Generator) và bộ phân biệt (Discriminator). GAN có giá trị lớn trong việc **tạo ra các mẫu gian lận tổng hợp để giải quyết vấn đề mất cân bằng dữ liệu**, cũng như dùng chính bộ phân biệt để phát hiện dị thường trong chuỗi hoạt động.
- **Mạng nơ-ron đồ thị (GNNs):** Chuyên gia trong việc **mô hình hóa các mối quan hệ tương tác phức tạp và cấu trúc mạng lưới** (như các giao dịch chuyển tiền liên ngân hàng, rửa tiền hoặc blockchain). GNNs nắm bắt tính không gian của gian lận có tổ chức bằng cách theo dõi các mạng lưới hành vi.
- **Transformer & Cơ chế Attention:** Tự động **tập trung sự "chú ý" vào các đặc trưng hoặc khoảng thời gian mang tính quyết định nhất** giúp dự đoán gian lận. Transformers xử lý toàn bộ dữ liệu song song thay vì tuần tự, giúp tăng tốc độ mô hình hóa tương quan dài hạn cực kỳ hiệu quả mà không bị rào cản tính toán như RNN.

**Phân loại theo mô hình huấn luyện (Learning Paradigms / Label Availability)**

Dựa trên lượng nhãn dữ liệu có sẵn, các phương pháp học sâu chia thành bốn loại học máy cơ bản:

- **Học có giám sát (Supervised Learning):** Yêu cầu dữ liệu phải **có nhãn phân loại rõ ràng** (Bình thường / Dị thường). Dù dễ huấn luyện các ranh giới để phân loại, nó gặp trở ngại cực lớn trong thực tế do chi phí dán nhãn tốn kém, và bộ dữ liệu tài chính thường bị mất cân bằng trầm trọng (số lượng gian lận rất nhỏ so với giao dịch hợp lệ).
- **Học bán giám sát (Semi-supervised Learning):** Mô hình **chủ yếu học từ một tập dữ liệu khổng lồ của các giao dịch "bình thường"** có gán nhãn hoặc một phần rất nhỏ gian lận. Phương pháp này vượt qua trở ngại về thiếu nhãn gian lận, bằng cách gán cờ dị thường cho bất kỳ thứ gì đi chệch khỏi phổ bình thường này.
- **Học không giám sát (Unsupervised Learning):** Phân tích trực tiếp từ dữ liệu thô **không cần bất kỳ nhãn nào**. Thuật toán tự tìm ra các cấu trúc, các cụm hoặc phân phối nội tại của hệ thống. Đây là con đường hứa hẹn nhất do thủ đoạn gian lận thay đổi từng ngày và người ta không thể dán nhãn cho các loại gian lận chưa từng xuất hiện (Zero-day fraud).
- **Học tự giám sát (Self-supervised Learning):** Biến thể linh hoạt này cho phép mô hình **tự tạo ra các "tín hiệu giám sát" từ trong chính dữ liệu gốc** chưa gắn nhãn (như việc tự tạo các vùng che khuất để dự đoán). Điều này tạo ra biểu diễn tiền huấn luyện vững chắc nhằm hỗ trợ tác vụ phát hiện gian lận ở giai đoạn sau.

**Phân loại theo cấp độ tích hợp hệ thống (Modeling Perspectives)**

Báo cáo phân loại của Pang và cộng sự (2021) phân rã cách tích hợp học sâu vào một bộ khung ba phần:

- **Học sâu để trích xuất đặc trưng (Feature Extraction):** Ở cấp độ này, mạng nơ-ron học sâu **đóng vai trò độc lập chỉ để nén và giảm chiều dữ liệu**. Sau khi các đặc trưng phi tuyến tính phức tạp được trích xuất thành vector nhỏ, chúng mới được chuyển cho các thuật toán truyền thống (như Support Vector Machine hay Random Forest) làm nhiệm vụ phát hiện cuối cùng.
- **Học biểu diễn chuẩn (Learning Feature Representations of Normality):** Hai module tối ưu hoá gắn liền với nhau để mô hình tập trung chuyên biệt vào việc nắm bắt các quy luật của "những hành vi hợp lệ". Nó thường dùng các hàm mục tiêu tái tạo, các mô hình sinh, hoặc phân loại tự giám sát để tối ưu biểu diễn này.
- **Học điểm dị thường từ đầu đến cuối (End-to-end Anomaly Score Learning):** Hợp nhất toàn bộ mọi quy trình. Mô hình học sâu nhận dữ liệu thô đầu vào và **học cách trả về trực tiếp một điểm số (score) đánh giá mức độ dị thường/gian lận**. Điều này được thực hiện qua các hàm mất mát thiết kế chuyên biệt để phân cấp mức độ bất thường, hoặc thông qua học hồi quy thứ tự (ordinal regression) và học phân loại một lớp (end-to-end one-class classification).

---

Ý tưởng xây dựng một **CSV AI Platform** kết hợp giữa phát hiện dị thường (Anomaly Detection) và tạo báo cáo tự động bằng NLP là một hướng đi cực kỳ bắt kịp xu hướng công nghệ hiện tại. Dựa trên các tài liệu nghiên cứu mới nhất, hệ thống bạn đang hình dung giải quyết được một trong những bài toán lớn nhất hiện nay: biến các mô hình AI từ những "hộp đen" (black-box) thành các công cụ có tính giải thích cao (Explainable AI - XAI) thông qua các báo cáo ngôn ngữ tự nhiên.
**1** - (
structures and the need to manually extract relevant features from the enormous transactional data. Deep learning
models enable using automated feature extraction and sequential learning, which in their turn employ
multidimensional data processing and therefore have a higher efficiency than classical techniques in real-time fraud
detection.
With the growing popularity of artificial intelligence in security uses throughout the financial institutions, there is a
need for explainable artificial intelligence (XAI). However, as it has been shown in the previous section, deep learning
08_ResearchPaper_InternalFraudDetection_18042024.pdf
)
**2** - (Method End-to-end Tailored Representation Intricate Relation Heterogeneity
Optimization Learning Learning Handling
Traditional × × Weak Weak
Deep   Strong Strong
Challenges CH1-6 CH1-6 CH1, CH2, CH3, CH5 CH3, CH5
minority groups presented in the data, such as under-represented groups in fraud detection and crime detection systems. An effective approach to mitigate this type of risk is to have anomaly explanation algorithms that provide straightforward clues about why a specific data instance is identified as anomaly. Human experts can then look into and correct the bias. Providing such explanation can be as important as detection accuracy in some applica-tions. However, most anomaly detection studies focus on detection accuracy only, ignoring the capability of providing explanation of the identified anomalies. To derive anomaly ex-planation from specific detection methods is still a largely unsolved problem, especially for complex models. Developing inherently interpretable anomaly detection models is also crucial, but it remains a main challenge to well balance the model’s interpretability and effectiveness.
Deep Learning for Anomaly Detection- A Review .pdf)

## Dưới đây là những phân tích và gợi ý kiến trúc cho nền tảng của bạn dựa trên các nguồn tài liệu:

### 1. CSV Anomaly Detection (Phát hiện Dị thường trên Dữ liệu CSV)

Dữ liệu CSV thường chứa hai dạng chính: Dữ liệu dạng bảng tĩnh (Tabular Data) hoặc Dữ liệu chuỗi thời gian (Time-series Data). Nền tảng của bạn có thể tích hợp các mô hình Học sâu (Deep Learning) mạnh mẽ sau để tự động trích xuất đặc trưng mà không cần thiết lập quy tắc thủ công:
**1** - (
structures and the need to manually extract relevant features from the enormous transactional data. Deep learning
models enable using automated feature extraction and sequential learning, which in their turn employ
multidimensional data processing and therefore have a higher efficiency than classical techniques in real-time fraud
detection.
With the growing popularity of artificial intelligence in security uses throughout the financial institutions, there is a
need for explainable artificial intelligence (XAI). However, as it has been shown in the previous section, deep learning
08_ResearchPaper_InternalFraudDetection_18042024.pdf
)

**2** - ()

- **Đối với CSV dạng bảng (Tabular Data):** Bạn có thể sử dụng các mô hình học máy sinh tạo (Generative models) như **AnoGAN**
  **3** - (AnoGAN for Tabular Data: A Novel Approach to Anomaly Detection
  Pavan Reddy1 and Aditya Singh1
  George Washington University, Washington, DC 20052, USA {pavan.reddy,adityasingh}@gwu.edu
  Abstract. Anomaly detection, a critical facet in data analysis, involves identifying patterns that deviate from expected behavior. This research addresses the complexities inherent in anomaly detection, exploring chal-lenges and adapting to sophisticated malicious activities. With applica-tions spanning cybersecurity, healthcare, finance, and surveillance, anoma-lies often signify critical information or potential threats. Inspired by the success of Anomaly Generative Adversarial Network (AnoGAN) in image domains, our research extends its principles to tabular data. Our con-tributions include adapting AnoGAN’s principles to a new domain and promising advancements in detecting previously undetectable anomalies. This paper delves into the multifaceted nature of anomaly detection, con-sidering the dynamic evolution of normal behavior, context-dependent anomaly definitions, and data-related challenges like noise and imbal-ances.
  AnoGAN for Tabular Data- A Novel Approach to Anomaly Detection.pdf)
  **4** - (2 P. Reddy and A. Singh
  applications in manufacturing, finance, and medical imaging, relying on models to identify abnormal patterns amidst regular data. Despite extensive research, managing complex, high-dimensional data remains a challenge. Various com-munities have developed specialized anomaly detection techniques tailored to specific domains.
  Generative Adversarial Networks (GANs), introduced by Ian Goodfellow [10] and colleagues, have emerged as a powerful modeling approach for handling high-dimensional data. Anomaly Generative Adversarial Network (AnoGAN) integrates traditional anomaly detection methods with GAN architecture, en-abling it to generate data while simultaneously learning typical data properties for anomaly detection.
  AnoGAN for Tabular Data- A Novel Approach to Anomaly Detection.pdf)
  hoặc **CT-GAN**.
  **5** - (p(x)= ∑M
  i=1πiN(x∣µi,Σi)→GMM Transformation
  where p(x)is the probability density function of the data xmodeled as a mixture of MGaussian distributions, πiare the mixing coefficients, µiand Σiare the mean and covariance of the i−thGaussian component, respectively.
  3.3 CT-GAN Implementation and Randomness Handling
  In our research methodology, the utilization of the original CT-GAN (Condi-tional Tabular Generative Adversarial Network) (Figure 5) [34] implementation plays a pivotal role in generating synthetic samples for anomaly detection. CT-GAN is a specialized GAN variant designed for tabular data, aiming to faithfully reproduce the statistical characteristics of the given dataset. However, the orig-inal CT-GAN implementation introduces a layer of unpredictability during the testing phase, manifested in the randomness inherent in the predictions gen-erated by the generator. To address this challenge and enhance the stability of the generated samples, we employ a modified softmax gumbel activation. This modification is instrumental in mitigating the unpredictable nature of the test predictions, ensuring a more consistent and reliable generation of synthetic samples. The application of the softmax gumbel activation contributes to the robustness and effectiveness of our anomaly detection framework by providing a more controlled and deterministic generation process for the synthetic data. Figure 6 shows the KDE for both the real and generated data after applying CT-GAN.
  AnoGAN for Tabular Data- A Novel Approach to Anomaly Detection.pdf
  ) Các mô hình này học phân phối của dữ liệu bình thường và phát hiện dị thường dựa trên "lỗi tái tạo" (reconstruction error) hoặc bằng cách đánh giá mức độ nhiễu (Deep Noise Evaluation).**6** - (Unsupervised Anomaly Detection for Tabular Data Using Deep Noise Evaluation
  Wei Dai, Kai Hwang, Jicong Fan\*
  The Chinese University of Hong Kong, Shenzhen, China weidai@link.cuhk.edu.com, hwangkai@cuhk.edu.cn, fanjicong@cuhk.edu.cn
  Abstract
  Unsupervised anomaly detection (UAD) plays an important role in modern data analytics and it is crucial to provide simple yet effective and guaranteed UAD algorithms for real applica-tions. In this paper, we present a novel UAD method for tabular data by evaluating how much noise is in the data. Specifically, we propose to learn a deep neural network from the clean (normal) training dataset and a noisy dataset, where the latter is generated by adding highly diverse noises to the clean data. The neural network can learn a reliable decision boundary between normal data and anomalous data when the diversity of the generated noisy data is sufficiently high so that the hard abnormal samples lie in the noisy region. Importantly, we provide theoretical guarantees, proving that the proposed method can detect anomalous data successfully, although the method does not utilize any real anomalous data in the training stage. Extensive experiments through more than 60 benchmark datasets demonstrate the effectiveness of the proposed method in comparison to 12 baselines of UAD. Our method obtains a 92.27% AUC score and a 1.68 ranking score on average. Moreover, compared to the state-of-the-art UAD methods, our method is easier to implement.
  Unsupervised Anomaly Detection for Tabular Data Using Deep Noise Evaluation .pdf)

- **Đối với CSV chuỗi thời gian (Time-series):** Nếu các cột trong CSV của bạn liên quan đến các bản ghi theo thời gian (ví dụ: log hệ thống, giao dịch tài chính), bạn có thể áp dụng các mô hình lai như **LSTM-CNN**
  **7** - (sequential transaction data with temporal relationships and CNNs to analyze spatial features of the processed data.
  So used with the strengths of two models, the hybrid architecture improves the accuracy of fraud detections.
  The system functions in a cyclic manner where transactions are constantly processed and each suspicious activity is
  detected on the spot. The main performance measures used in the model are accuracy, its precision, its recall, and F1
  score.
  Figure 1.1: Conceptual Framework
  08_ResearchPaper_InternalFraudDetection_18042024.pdf)
  , **BiLSTM-GRU** **8** - (proposed solution is an ensemble model combining Bidirectional Gated Recurrent Unit
  (BiGRU) and Bidirectional Long Short-Term Memory (BiLSTM) networks, designed to
  capture complex transactional patterns more effectively. Comparative analysis of six
  machine learning classifiers—AdaBoost, Naïve Bayes, Decision Tree, Logistic
  Regression, Random Forest, and Voting—demonstrates that our BiLSTM-BiGRU
  ensemble model outperforms traditional methods, achieving a fraud detection
  performance score of 89.22%. This highlights the advanced deep learning model's
  ADVANCED FRAUD DETECTION IN CARD-BASED FINANCIAL SYSTEMS USING A BIDIRECTIONAL LSTM-GRU ENSEMBLE MODEL .pdf)
  , hoặc **TranAD** (Deep Transformer Networks) **9** - (TranAD: Deep Transformer Networks for Anomaly Detection in Multivariate Time Series Data
  Shreshth Tuli Imperial College London
  London, UK s.tuli20@imperial.ac.uk
  Giuliano Casale Imperial College London
  London, UK g.casale@imperial.ac.uk
  Nicholas R. Jennings Loughborough University
  London, UK n.r.jennings@lboro.ac.uk
  Abstract Efficient anomaly detection and diagnosis in multivariate time-series data is of great importance for modern industrial applications. However, building a system that is able to quickly and accurately pinpoint anomalous observations is a challenging problem. This is due to the lack of anomaly labels, high data volatility and the de-mands of ultra-low inference times in modern applications. Despite the recent developments of deep learning approaches for anomaly detection, only a few of them can address all of these challenges. In this paper, we propose TranAD, a deep transformer network based anomaly detection and diagnosis model which uses attention-based sequence encoders to swiftly perform inference with the knowledge of the broader temporal trends in the data. TranAD uses focus score-based self-conditioning to enable robust multi-modal feature extraction and adversarial training to gain stability. Addi-tionally, model-agnostic meta learning (MAML) allows us to train the model using limited data. Extensive empirical studies on six pub-licly available datasets demonstrate that TranAD can outperform state-of-the-art baseline methods in detection and diagnosis perfor-mance with data and time-efficient training. Specifically, TranAD increases F1 scores by up to 17%, reducing training times by up to 99% compared to the baselines.
  TranAD- Deep Transformer Networks for Anomaly Detection in Multivariate Time Series Data .pdf)
  . Mô hình TranAD đặc biệt vượt trội nhờ khả năng xử lý song song siêu tốc và giải quyết các phụ thuộc thời gian dài hạn.**9**
  **10** - (New insights. As noted above, recurrent models based on prior methods are not only slow and computationally expensive, but are
  Shreshth Tuli, Giuliano Casale, and Nicholas R. Jennings
  also unable to model long-term trends effectively [4, 14, 62]. This is because, at each timestamp, a recurrent model needs to first perform inference for all previous timestamps before proceeding further. Re-cent developments of the transformer models allow single-shot in-ference with the complete input series using position encoding [51]. Using transformers allows much faster detection compared to re-current methods by parallelizing inference on GPUs [19]. However, transformers also provide the benefit of being able to encode large sequences with accuracy and training/inference times nearly ag-nostic to the sequence length [51]. Thus, we use transformers to grow the temporal context information sent to an anomaly detector without significantly increasing the computational overheads.
  TranAD- Deep Transformer Networks for Anomaly Detection in Multivariate Time Series Data .pdf)

### 2. Report Generation (Tạo Báo cáo bằng NLP)

Một trong những thách thức lớn nhất (Thách thức thứ 6 - CH6) của các mô hình phát hiện dị thường là chúng thiếu đi sự giải thích (anomaly explanation)**2**. Nền tảng của bạn áp dụng NLP để tạo báo cáo tiếng Việt là một giải pháp hoàn hảo cho vấn đề này.

- **Sử dụng Mô hình Ngôn ngữ Lớn (LLMs):** Các nghiên cứu gần đây đã chứng minh LLMs có khả năng tuyệt vời trong việc giải thích dị thường, tổng hợp các sự cố và đánh giá mức độ rủi ro của dữ liệu.
  **11** - (
  [6] Yinfang Chen, Huaibing Xie, Minghua Ma, Yu Kang, Xin Gao, Liu Shi, Yunjie Cao, Xuedong Gao, Hao Fan, Ming Wen, et al. 2024. Automatic Root Cause Analysis via Large Language Models for Cloud Incidents. (2024).
  [7] Yuhang Chen, Chaoyun Zhang, Minghua Ma, Yudong Liu, Ruomeng Ding, Bowen Li, Shilin He, Saravan Rajmohan, Qingwei Lin, and Dongmei Zhang. 2023. Imdif-fusion: Imputed diffusion models for multivariate time series anomaly detection. VLDB (2023).
  [8] Liang Dai, Tao Lin, Chang Liu, Bo Jiang, Yanwei Liu, Zhen Xu, and Zhi-Li Zhang. 2021. SDFVAE: Static and Dynamic Factorized VAE for Anomaly Detection of Multivariate CDN KPIs. In Proceedings of the Web Conference 2021 (Ljubljana, Slovenia) (WWW ’21). Association for Computing Machinery, New York, NY, USA, 3076–3086. https://doi.org/10.1145/3442381.3450013
  VAE for Time Series Revisiting VAE for Unsupervised Time Series Anomaly Detection- A Frequency Perspective.pdf
  )

**12** - ([18] Yuxuan Jiang, Chaoyun Zhang, Shilin He, Zhihao Yang, Minghua Ma, Si Qin, Yu Kang, Yingnong Dang, Saravan Rajmohan, Qingwei Lin, et al. 2024. Xpert: Empowering Incident Management with Query Recommendations via Large Language Models. (2024).
[19] Pengxiang Jin, Shenglin Zhang, Minghua Ma, Haozhe Li, Yu Kang, Liqun Li, Yudong Liu, Bo Qiao, Chaoyun Zhang, Pu Zhao, et al. 2023. Assess and Summarize: Improve Outage Understanding with Large Language Models. (2023).
[20] Harshavardhan Kamarthi, Lingkai Kong, Alexander Rodriguez, Chao Zhang, and B Aditya Prakash. 2022. CAMul: Calibrated and Accurate Multi-View Time-Series Forecasting. In Proceedings of the ACM Web Conference 2022 (Virtual Event, Lyon, France) (WWW ’22). Association for Computing Machinery, New York, NY, USA,
3174–3185. https://doi.org/10.1145/3485447.3512037
VAE for Time Series Revisiting VAE for Unsupervised Time Series Anomaly Detection- A Frequency Perspective.pdf
)

- Mặc dù các tài liệu không đề cập trực tiếp đến việc tạo báo cáo bằng tiếng Việt _(lưu ý: đây là tính năng bạn có thể tự thiết lập bằng các LLM hiện đại như GPT-4 hay Claude)_, nhưng cơ chế sử dụng NLP để phân tích dữ liệu dạng bảng đã được chứng minh hiệu quả trong các tác vụ như phân tích báo cáo tài chính, nhật ký mạng hoặc lời văn mô tả khiếu nại.
  **13** - (
  Transformers: Unlike CNNs and RNNs, which process all points in the input se-quence step by step, transformers process all points at once. The self-attention mecha-nism and feed-forward networks of Transformers enable it to model complex relation-
  7
  ships and extract meaningful features from sequential data, which is very useful to recognizing patterns in transactional data, user behavior, or network interactions in fraud detection.
  Natural Language Processing (NLP): NLP enhances fraud detection by an-alyzing unstructured textual data such as financial reports [59], tax compliance and financial regulation [12], and claims narratives [23]. Key techniques include sentiment analysis, readability metrics, and feature extraction (e.g., Bag-of-Words, TF-IDF, and word embeddings). These features are integrated with traditional fraud indicators in machine learning models, improving accuracy and recall [59].
  [12] Bajpai, A. (2023). Evaluating the impact of artificial intelligence on enhancing tax com-pliance and financial regulation. International Journal of Multidisciplinary Research and Technology.
  [23] Fursov, I., Kovtun, E., Rivera-Castro, R., Zaytsev, A., Khasyanov, R., Spindler, M., and Burnaev, E. (2022). Sequence embeddings help detect insurance fraud. IEEE Access.
  [59] Zhang, Z., Ma, Y., and Hua, Y. (2022). Financial fraud identification based on stacking ensemble learning algorithm: Introducing md&a text information. Computational Intelli-gence and Neuroscience.
  Year-over-Year Developments in Financial Fraud Detection via Deep Learning- A Systematic Literature Review.pdf
  )

### 3. Full Analysis Pipeline (Đề xuất Kiến trúc Pipeline Toàn diện)

Dựa trên framework **TAD-GP (Tabular Anomaly Detection via Guided Prompts)** được giới thiệu trong nghiên cứu, bạn có thể thiết kế Full Analysis Pipeline của mình theo các bước sau:
**14** - (
Xiaoyong Zhao, Xingxin Leng, Lei Wang, Ningning Wang & Yanqiong Liu
In cybersecurity, anomaly detection in tabular data is essential for ensuring information security. While traditional machine learning and deep learning methods have shown some success, they continue to face significant challenges in terms of generalization. To address these limitations, this paper presents an innovative method for tabular data anomaly detection based on large language models, called “Tabular Anomaly Detection via Guided Prompts” (TAD-GP). This approach utilizes a 7-billion-parameter open-source model and incorporates strategies such as data sample introduction, anomaly type recognition, chain-of-thought reasoning, multi-turn dialogue, and key information reinforcement. Experimental results indicate that the TAD-GP framework improves F1 scores by 79.31%, 97.96%, and 59.09% on the CICIDS2017, KDD Cup 1999, and UNSW-NB15 datasets, respectively. Furthermore, the smaller-scale TAD-GP model outperforms larger models across multiple datasets, demonstrating its practical potential in environments with constrained computational resources and requirements for private deployment. This method addresses a critical gap in research on anomaly detection in cybersecurity, specifically using small-scale open-source models
Efficient anomaly detection in tabular cybersecurity data using large language models
)
**15** - (
Tabular anomaly detection via guided prompting (TAD-GP) This paper introduces a novel approach for anomaly detection in tabular network data, called the Tabular Anomaly Detection via Guided Prompts (TAD-GP) framework (Figs. 1 and 2 ). The framework is designed to improve the performance of small-scale large language models in anomaly detection tasks. TAD-GP incorporates several key techniques, including data sample introduction, fine-grained anomaly classification, chain-of-thought reasoning, multi-turn interaction, and key information reinforcement. These strategies collectively guide the model through a structured analytical process, resulting in more precise and efficient anomaly detection.

Efficient anomaly detection in tabular cybersecurity data using large language models .pdf
)

- **Bước 1: Tiền xử lý (Preprocessing):** Tải file CSV, làm sạch dữ liệu (xử lý giá trị thiếu, loại bỏ trùng lặp) và chuyển đổi định dạng CSV thành JSON. Định dạng JSON giúp các mô hình NLP dễ dàng phân tích cấu trúc và thuộc tính của dữ liệu hơn.
  **16** - (
  Efficient introduction of data samples To improve the model’s understanding of tabular data, the TAD-GP framework utilizes a strategy of selecting one normal and one anomalous sample at random. This helps the model quickly familiarize itself with key data

  Efficient anomaly detection in tabular cybersecurity data using large language models .pdf
  )

  **17** - (
  Data preprocessing Data cleaning Remove duplicates and address missing values in the dataset to maintain data integrity and consistency.
  Data balancing Utilize sampling techniques to achieve a balanced ratio of normal to anomalous data, thereby preventing class imbalance from adversely affecting the model’s training process.
  Data format conversion Convert tabular data into a JSON format that is compatible with large language models, facilitating efficient parsing of structured data by the model.

  Efficient anomaly detection in tabular cybersecurity data using large language models .pdf
  )

- **Bước 2: Quét dị thường (Hybrid Detection):**
  - Với các tập CSV khổng lồ, hãy chạy dữ liệu qua một mô hình Deep Learning (ví dụ: Autoencoder hoặc TranAD) trước để khoanh vùng (filter) các hàng dữ liệu có điểm số dị thường (anomaly score) cao nhất. **9**
  - Với dữ liệu nhỏ hơn hoặc cần phân tích sâu, đưa trực tiếp chuỗi JSON vào LLM.

- **Bước 3: Phân tích & Tạo báo cáo (Reasoning & Report Generation):** Sử dụng chiến lược **Chain-of-Thought (Chuỗi suy luận)** phân tích theo phương châm "Bộ phận trước, Tổng thể sau".
  **18** - (
  “Part-first, whole-later” chain-of-thought strategy To improve the interpretability of anomaly detection, the TAD-GP framework employs a “part-first, whole-later” chain-of-thought strategy. In this approach, the model begins by independently analyzing each feature to evaluate the likelihood of deviation from normal ranges. It then synthesizes the interactions among multiple features to identify potential anomaly patterns, as illustrated in the purple section of Fig. 2.
  For instance, in the Data Inspection section, we guide the model to focus on individual features of the data instances. In the Pattern Recognition section, we direct the model to consider interactions among multiple features. Finally, in the Decision Making section, we assist the model in making the final judgment.

  Efficient anomaly detection in tabular cybersecurity data using large language models .pdf
  )

Bạn thiết kế các prompt (câu lệnh) cho LLM đi qua các bước:

1.  _Data Inspection (Kiểm tra dữ liệu)_
2.  _Feature Analysis (Phân tích đặc trưng - đánh giá sự tương quan của các cột trong CSV)_
3.  _Pattern Recognition (Nhận diện các mẫu đáng ngờ)_
4.  _Decision Making (Kết luận)_.
    **19** - (
    This strategy enhances understanding of the complex relationships among data features, enabling the model to detect not only explicit anomalies but also more subtle combinations of anomaly patterns. This significantly improves its detection capability. Particularly in high-dimensional and complex data scenarios, the strategy allows the model to analyze feature dependencies in greater detail, leading to more comprehensive and accurate judgments.
    Fig. 1. Structured Processing Flowchart for Tabular Data Anomaly Detection. This figure outlines the complete process from raw data input to the final anomaly detection output. The data is first converted into JSON format and integrated into a specially designed multi-turn dialogue. The large language model then generates the corresponding linguistic analysis and anomaly detection results, which are followed by a performance evaluation of the model.

    Efficient anomaly detection in tabular cybersecurity data using large language models .pdf
    )

- **Bước 4: Xuất báo cáo tiếng Việt:** Chỉ thị cho NLP model dịch và trình bày các bước suy luận trên thành một bản báo cáo tóm tắt bằng tiếng Việt, giải thích rõ ràng tại sao hàng/cột trong CSV bị đánh dấu là lỗi chất lượng hoặc gian lận.**12**, **19**

Nền tảng của bạn sẽ giải quyết được vấn đề "hộp đen" của AI truyền thống, đồng thời đáp ứng được các yêu cầu về tính minh bạch và tuân thủ quy định.**2**, Bạn có muốn đào sâu hơn vào việc thiết kế cấu trúc mạng Deep Learning cụ thể cho phần Anomaly Detection không?
**20** - (
Expert Systems With Applications 193 (2022) 116429
Available online 31 December 2021 0957-4174/© 2022 The Authors. Published by Elsevier Ltd. This is an open access article under the CC BY-NC-ND license (http://creativecommons.org/licenses/by-nc-nd/4.0/).
Review
Financial Fraud: A Review of Anomaly Detection Techniques and Recent Advances
Waleed Hilal a, S. Andrew Gadsden a,\*, John Yawney b
a McMaster University, Canada b Adastra Corporation, Canada
A R T I C L E I N F O
Keywords: Index Terms — Anomaly Outlier Anomaly detection Outlier detection Machine learning Deep learning Financial fraud Credit card fraud Insurance fraud Securities and commodities fraud Insider trading Money laundering

Financial Fraud- A Review of Anomaly Detection Techniques and Recent Advances .pdf
)

## GANs: Giải Pháp Cân Bằng Dữ Liệu Trong Phát Hiện Gian Lận

Trong các hệ thống phát hiện dị thường và gian lận, nơi số lượng các giao dịch bất thường vô cùng hiếm hoi so với dữ liệu hợp lệ, Mạng đối nghịch tạo sinh (GANs) được ứng dụng như một giải pháp đột phá để giải quyết vấn đề mất cân bằng dữ liệu (class imbalance). Thay vì chỉ lấy mẫu lại dữ liệu hiện có, GANs hoạt động như một Mô hình sinh dữ liệu (Data Generation Model) để tiêm thêm dữ liệu thiểu số tổng hợp vào tập huấn luyện. **1**,**2**,**3**

Dưới đây là các phương pháp và cơ chế kết hợp GANs để xử lý mất cân bằng dữ liệu dựa trên các nguồn tài liệu:
**1. Sinh dữ liệu tổng hợp chân thực (Realistic Synthetic Data Generation)**Cơ chế cốt lõi của GANs trong việc cân bằng dữ liệu là sử dụng một mạng sinh (Generator) để học phân phối của dữ liệu nhóm thiểu số (chẳng hạn như dữ liệu gian lận) từ một véc-tơ nhiễu ngẫu nhiên [4]. Trong khi đó, mạng phân biệt (Discriminator) cố gắng phân biệt giữa mẫu thật và mẫu giả. Quá trình cạnh tranh này ép Generator tạo ra các mẫu gian lận nhân tạo có đặc tính thống kê giống hệt như gian lận thực tế [3, 4]. Việc bổ sung các mẫu này giúp mô hình phân loại không bị thiên lệch (bias) về phía nhóm dữ liệu đa số (dữ liệu bình thường) [1, 5]. 2. Kết hợp GANs với kỹ thuật SMOTENhiều nghiên cứu thiết kế mô hình lai kết hợp trực tiếp GANs với Kỹ thuật lấy mẫu quá mức thiểu số tổng hợp (SMOTE) để tối ưu hóa việc cân bằng dữ liệu [6-8].
SMOTE giúp lấy mẫu quá mức bằng cách nội suy tuyến tính giữa các điểm dữ liệu gian lận hiện có [9].
GANs được sử dụng để tiêm các ví dụ đối nghịch (adversarial examples), sinh ra các kịch bản gian lận nhân tạo mới [8]. Sự kết hợp này vừa giúp gia tăng số lượng mẫu thiểu số một cách nhanh chóng, vừa giúp mô hình nhận diện được các chiêu thức gian lận tinh vi, mới nổi mang tính "trông có vẻ hợp lệ" (look-alike) mà các hệ thống thông thường hay bỏ sót [6, 8]. 3. Tăng cường dữ liệu (Data Augmentation) để cải thiện độ đa dạngCác phương pháp tăng cường dữ liệu truyền thống (như sao chép, dịch chuyển) thường không nắm bắt được các phân phối mới của các dị thường chưa biết. Bằng cách sinh ra dữ liệu tổng hợp dựa trên GANs, mô hình có thể tạo ra các mẫu dị thường với sự đa dạng cao về hình dạng, vị trí và góc độ [10, 11]. Điều này không chỉ giải quyết triệt để sự khan hiếm của mẫu dị thường mà còn ngăn chặn hiện tượng quá khớp (overfitting) vào một số ít mẫu gian lận có sẵn, giúp mô hình tổng quát hóa tốt hơn trên dữ liệu thực tế [10, 11]. 4. Sử dụng các biến thể GANs chuyên biệt cho mất cân bằng
Conditional GANs (CGANs): Được sử dụng để tạo ra các mẫu tổng hợp cho lớp thiểu số với sự định hướng của nhãn dữ liệu, kết hợp với phân kỳ Kullback-Leibler để hướng dẫn mô hình học phân phối của lớp thiểu số một cách cực kỳ chuẩn xác [1].
Wasserstein GANs (WGANs): Được sử dụng để thay thế GAN tiêu chuẩn nhằm đem lại sự ổn định cao hơn trong quá trình huấn luyện và khắc phục hiện tượng sụp đổ mô hình (mode collapse), từ đó tạo ra các mẫu gian lận cân bằng đáng tin cậy hơn để cải thiện hiệu suất phân loại [12].
Complementary GANs (ví dụ: OCAN): Trong những trường hợp cực đoan không có dữ liệu gian lận (chỉ có dữ liệu người dùng bình thường), GANs được huấn luyện để sinh ra các "mẫu bổ sung" nằm ở vùng mật độ thấp của dữ liệu bình thường. Các mẫu giả này đóng vai trò là "dị thường giả định" (negative reference instances) để huấn luyện bộ phân loại một lớp nhận diện được các sai lệch [13-15].
**Hiệu quả mang lại:**Việc kết hợp GANs để cân bằng tập dữ liệu mang lại cải thiện lớn đối với các chỉ số quan trọng, đặc biệt là tăng mạnh tỷ lệ thu hồi (Recall) và điểm F1-Score [12, 16]. Nhờ được huấn luyện trên một tập dữ liệu đã được cân bằng bởi GANs, mô hình giảm thiểu hiện tượng bỏ lọt các giao dịch gian lận nguy hiểm mà không làm tăng quá mức tỷ lệ cảnh báo sai (False Positives) [16].

---

Kiến Trúc Nền Tảng AI Phát Hiện Dị Thường CSV
Ý tưởng xây dựng một CSV AI Platform kết hợp giữa phát hiện dị thường (Anomaly Detection) và tạo báo cáo tự động bằng NLP là một hướng đi cực kỳ bắt kịp xu hướng công nghệ hiện tại. Dựa trên các tài liệu nghiên cứu mới nhất, hệ thống bạn đang hình dung giải quyết được một trong những bài toán lớn nhất hiện nay: biến các mô hình AI từ những "hộp đen" (black-box) thành các công cụ có tính giải thích cao (Explainable AI - XAI) thông qua các báo cáo ngôn ngữ tự nhiên [1, 2].
Dưới đây là những phân tích và gợi ý kiến trúc cho nền tảng của bạn dựa trên các nguồn tài liệu:

1. CSV Anomaly Detection (Phát hiện Dị thường trên Dữ liệu CSV)
   Dữ liệu CSV thường chứa hai dạng chính: Dữ liệu dạng bảng tĩnh (Tabular Data) hoặc Dữ liệu chuỗi thời gian (Time-series Data). Nền tảng của bạn có thể tích hợp các mô hình Học sâu (Deep Learning) mạnh mẽ sau để tự động trích xuất đặc trưng mà không cần thiết lập quy tắc thủ công [1]:
   Đối với CSV dạng bảng (Tabular Data): Bạn có thể sử dụng các mô hình học máy sinh tạo (Generative models) như AnoGAN [3, 4] hoặc CT-GAN [5]. Các mô hình này học phân phối của dữ liệu bình thường và phát hiện dị thường dựa trên "lỗi tái tạo" (reconstruction error) hoặc bằng cách đánh giá mức độ nhiễu (Deep Noise Evaluation) [6].
   Đối với CSV chuỗi thời gian (Time-series): Nếu các cột trong CSV của bạn liên quan đến các bản ghi theo thời gian (ví dụ: log hệ thống, giao dịch tài chính), bạn có thể áp dụng các mô hình lai như LSTM-CNN [7], BiLSTM-GRU [8], hoặc TranAD (Deep Transformer Networks) [9]. Mô hình TranAD đặc biệt vượt trội nhờ khả năng xử lý song song siêu tốc và giải quyết các phụ thuộc thời gian dài hạn [9, 10].
2. Report Generation (Tạo Báo cáo bằng NLP)
   Một trong những thách thức lớn nhất (Thách thức thứ 6 - CH6) của các mô hình phát hiện dị thường là chúng thiếu đi sự giải thích (anomaly explanation) [2]. Nền tảng của bạn áp dụng NLP để tạo báo cáo tiếng Việt là một giải pháp hoàn hảo cho vấn đề này.
   Sử dụng Mô hình Ngôn ngữ Lớn (LLMs): Các nghiên cứu gần đây đã chứng minh LLMs có khả năng tuyệt vời trong việc giải thích dị thường, tổng hợp các sự cố và đánh giá mức độ rủi ro của dữ liệu [11, 12].
   Mặc dù các tài liệu không đề cập trực tiếp đến việc tạo báo cáo bằng tiếng Việt (lưu ý: đây là tính năng bạn có thể tự thiết lập bằng các LLM hiện đại như GPT-4 hay Claude), nhưng cơ chế sử dụng NLP để phân tích dữ liệu dạng bảng đã được chứng minh hiệu quả trong các tác vụ như phân tích báo cáo tài chính, nhật ký mạng hoặc lời văn mô tả khiếu nại [13].
3. Full Analysis Pipeline (Đề xuất Kiến trúc Pipeline Toàn diện)
   Dựa trên framework TAD-GP (Tabular Anomaly Detection via Guided Prompts) được giới thiệu trong nghiên cứu, bạn có thể thiết kế Full Analysis Pipeline của mình theo các bước sau [14, 15]:
   Bước 1: Tiền xử lý (Preprocessing): Tải file CSV, làm sạch dữ liệu (xử lý giá trị thiếu, loại bỏ trùng lặp) và chuyển đổi định dạng CSV thành JSON. Định dạng JSON giúp các mô hình NLP dễ dàng phân tích cấu trúc và thuộc tính của dữ liệu hơn [16, 17].
   Bước 2: Quét dị thường (Hybrid Detection):
   Với các tập CSV khổng lồ, hãy chạy dữ liệu qua một mô hình Deep Learning (ví dụ: Autoencoder hoặc TranAD) trước để khoanh vùng (filter) các hàng dữ liệu có điểm số dị thường (anomaly score) cao nhất [9].
   Với dữ liệu nhỏ hơn hoặc cần phân tích sâu, đưa trực tiếp chuỗi JSON vào LLM.
   Bước 3: Phân tích & Tạo báo cáo (Reasoning & Report Generation): Sử dụng chiến lược Chain-of-Thought (Chuỗi suy luận) phân tích theo phương châm "Bộ phận trước, Tổng thể sau" [18]. Bạn thiết kế các prompt (câu lệnh) cho LLM đi qua các bước:
   Data Inspection (Kiểm tra dữ liệu)
   Feature Analysis (Phân tích đặc trưng - đánh giá sự tương quan của các cột trong CSV)
   Pattern Recognition (Nhận diện các mẫu đáng ngờ)
   Decision Making (Kết luận) [19].
   Bước 4: Xuất báo cáo tiếng Việt: Chỉ thị cho NLP model dịch và trình bày các bước suy luận trên thành một bản báo cáo tóm tắt bằng tiếng Việt, giải thích rõ ràng tại sao hàng/cột trong CSV bị đánh dấu là lỗi chất lượng hoặc gian lận [12, 19].
   Nền tảng của bạn sẽ giải quyết được vấn đề "hộp đen" của AI truyền thống, đồng thời đáp ứng được các yêu cầu về tính minh bạch và tuân thủ quy định [2, 20]. Bạn có muốn đào sâu hơn vào việc thiết kế cấu trúc mạng Deep Learning cụ thể cho phần Anomaly Detection không?
