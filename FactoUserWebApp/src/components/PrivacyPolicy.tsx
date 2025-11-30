// import { Capacitor } from '@capacitor/core';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile' | 'course-payment' | 'course-details' | 'terms' | 'privacy';

interface PrivacyPolicyProps {
  onNavigate: (page: PageType, serviceId?: string, courseId?: string, filter?: string) => void;
}

export function PrivacyPolicy({ onNavigate }: PrivacyPolicyProps) {
  // const isMobile = Capacitor.isNativePlatform() || (typeof window !== 'undefined' && window.innerWidth < 768);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center text-[#007AFF] hover:text-[#0056CC] mb-6 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-10 space-y-8">
          {/* Introduction */}
          <section className="border-b border-gray-200 dark:border-gray-700 pb-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">1. Introduction</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              At Facto Management Consultancy (referred to as "Facto"), we prioritize protecting your personal information. 
              Our practices are designed to comply with the Information Technology Act, 2000, its amendments, and relevant Indian laws. 
              We are committed to fostering trust and safeguarding our clients' data across all our services.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              This Privacy Policy outlines our approach to collecting, using, sharing, and safeguarding personal information. 
              It applies to our website, mobile applications, and services related to financial and tax advisory, including 
              income tax filings, tax scrutiny, and financial planning services.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">2. Who This Privacy Policy Covers</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              This policy is applicable to:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 list-disc list-inside ml-4">
              <li><strong>Clients:</strong> Individuals or entities using our services</li>
              <li><strong>Advisers:</strong> Professionals working with Facto to provide expert guidance</li>
              <li><strong>Visitors:</strong> Users browsing our website or app</li>
              <li><strong>Service Providers:</strong> Third parties offering services on behalf of Facto</li>
              <li><strong>Enquirers:</strong> Individuals seeking information about our services</li>
              <li><strong>Direct/Indirect Beneficiaries:</strong> Those benefiting from our offerings</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
              We collectively refer to these groups as "you" throughout this policy.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">3. Information We Collect</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              We may collect the following categories of information:
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">a. Directly Provided Data</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 list-disc list-inside ml-4">
                  <li><strong>Personal Details:</strong> Name, address, email, phone number, PAN, and bank account information</li>
                  <li><strong>Tax Information:</strong> Income, deductions, expenses, assets, liabilities, and tax forms (e.g., Form 15CA, Form 16, Form 26AS)</li>
                  <li><strong>Service-Specific Data:</strong> Notices for tax scrutiny, advisory preferences, and related documents</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">b. Automatically Collected Data</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 list-disc list-inside ml-4">
                  <li><strong>Website Interaction Details:</strong> IP address, browser type, location, and cookie-related information</li>
                  <li><strong>Communication Records:</strong> Emails, voicemails, or correspondence</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">c. Third-Party/Publicly Available Data</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 list-disc list-inside ml-4">
                  <li>Information retrieved from publicly accessible sources or social media</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">4. Why We Collect Your Information</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Your data is collected to:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 list-disc list-inside ml-4">
              <li>Enhance service personalization and quality</li>
              <li>Facilitate compliance with legal and regulatory requirements</li>
              <li>Prevent fraud and ensure security</li>
              <li>Provide financial and tax-related services effectively</li>
              <li>Improve website functionality and user experience</li>
              <li>Deliver targeted communication, such as newsletters or service updates</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">5. How We Use Your Information</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Your information may be used for the following purposes:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 list-disc list-inside ml-4">
              <li>Managing tax-related services (e.g., ITR filing, tax notices)</li>
              <li>Conducting identity verification and KYC checks</li>
              <li>Improving operational efficiency and service quality</li>
              <li>Enabling lawful data sharing with affiliates, regulators, and partners</li>
              <li>Sending notifications or marketing updates</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">6. Consent</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Your use of our website or services signifies consent to this policy. Specific processing activities may require 
              additional consent, which can be withdrawn at any time.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">7. Sharing Your Data</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Facto may share data with:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 list-disc list-inside ml-4">
              <li><strong>Affiliates and Group Companies:</strong> For operational purposes</li>
              <li><strong>Service Providers:</strong> For tasks like KYC verification and data analysis</li>
              <li><strong>Regulators and Authorities:</strong> To comply with legal obligations</li>
              <li><strong>Marketing Partners:</strong> Limited to lawful purposes under joint marketing arrangements</li>
              <li><strong>Legal Proceedings:</strong> As required for court orders or investigations</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
              We ensure that third parties comply with robust data protection practices.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">8. Security of Your Data</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Facto employs industry-standard security measures to protect your data, including:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 list-disc list-inside ml-4">
              <li>SSL encryption for data transmission</li>
              <li>Regular security audits and monitoring</li>
              <li>Access controls and password protection for sensitive information</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">9. Data Retention</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Your personal data is retained for as long as necessary to fulfill the purposes outlined or to comply with legal 
              obligations. Once retention periods expire, data is securely deleted.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">10. Your Rights</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              You have the right to:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 list-disc list-inside ml-4">
              <li>Access your data or request corrections</li>
              <li>Object to certain processing activities</li>
              <li>Withdraw consent for data processing (where applicable)</li>
              <li>Request the deletion of data no longer required</li>
              <li>File complaints with the relevant data protection authorities</li>
            </ul>
          </section>

          {/* Section 11 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">11. Cookies Policy</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              We use cookies to:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 list-disc list-inside ml-4">
              <li>Enhance website functionality and user experience</li>
              <li>Analyze visitor interactions and preferences</li>
              <li>Serve tailored advertisements through third-party providers</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
              You can manage or disable cookies through your browser settings.
            </p>
          </section>

          {/* Section 12 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">12. Changes to This Policy</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              This policy may be updated to reflect changes in our services or legal requirements. We recommend reviewing this 
              document periodically for the latest information.
            </p>
          </section>

          {/* Section 13 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">13. Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              For privacy-related inquiries, contact:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Grievance Officer</h3>
                <p className="text-gray-700 dark:text-gray-300"><strong>Email:</strong> Facto.consultancy@gmail.com</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Phone:</strong> 8877-577-977</p>
              </div>
            </div>
          </section>

          {/* Refund Policy Section */}
          <div className="mt-12 pt-8 border-t-2 border-gray-300 dark:border-gray-600">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Refund Policy</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              At Facto Management Consultancy, we are dedicated to providing high-quality services to our valued customers. 
              We recognize that unforeseen circumstances might lead to the need for a refund. To ensure transparency, we have 
              outlined our refund policy below in a clear and concise manner.
            </p>

            {/* Refund Section 1 */}
            <section className="space-y-4 mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">1. Eligibility Criteria</h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300 list-disc list-inside ml-4">
                <li>Refund requests are applicable for paid services availed within the last 30 days</li>
                <li>Customers can request a refund under the following conditions:</li>
              </ul>
              <div className="ml-8 space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">a. Commencement Delay</h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    If the Facto Management Consultancy team fails to initiate the agreed-upon service within 72 hours of payment, 
                    a full refund will be issued promptly.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">b. Government Deadline Compliance</h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    In cases where the team is unable to meet the deadlines mandated by government regulations, customers are 
                    eligible for a full refund.
                  </p>
                </div>
              </div>
            </section>

            {/* Refund Section 2 */}
            <section className="space-y-4 mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">2. Refund Request Process</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                To ensure a smooth refund experience, please follow these steps:
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300 list-disc list-inside ml-4">
                <li>Contact our customer support team within 30 days of your service purchase</li>
                <li>Provide the reason for your refund request, as outlined in the eligibility criteria above</li>
                <li>Share any additional relevant details to facilitate the review process</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
                Our team will carefully evaluate your request and determine its validity.
              </p>
            </section>

            {/* Refund Section 3 */}
            <section className="space-y-4 mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">3. Refund Timeline</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                Once your refund request is approved:
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300 list-disc list-inside ml-4">
                <li>Refunds will be processed within 14 business days</li>
                <li>The refund will be issued using the same payment method as the original transaction</li>
              </ul>
            </section>

            {/* Refund Section 4 */}
            <section className="space-y-4 mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">4. Exceptions and Fraud Prevention</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300 list-disc list-inside ml-4">
                <li>Refund requests may be declined if found to be fraudulent or if there is a breach of our terms and conditions</li>
              </ul>
            </section>

            {/* Refund Section 5 */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">5. Policy Updates</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                This refund policy is subject to change without prior notice. We encourage you to review it periodically or 
                contact us for the latest details.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

