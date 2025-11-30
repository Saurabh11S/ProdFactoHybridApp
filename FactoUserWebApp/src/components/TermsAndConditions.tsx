// import { Capacitor } from '@capacitor/core';

type PageType = 'home' | 'services' | 'learning' | 'shorts' | 'updates' | 'login' | 'signup' | 'service-details' | 'documents' | 'payment' | 'profile' | 'course-payment' | 'course-details' | 'terms' | 'privacy';

interface TermsAndConditionsProps {
  onNavigate: (page: PageType, serviceId?: string, courseId?: string, filter?: string) => void;
}

export function TermsAndConditions({ onNavigate }: TermsAndConditionsProps) {
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
            Terms and Conditions
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-10 space-y-8">
          {/* Introduction */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Welcome to Facto Management Consultancy. These Terms and Conditions govern your use of our financial consultancy services. 
              By availing of our services, you agree to be bound by these terms. Please read them carefully.
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">1. Scope of Services</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>Financial Consultancy, including tax planning, GST compliance, and income tax filing</li>
              <li>Assistance in financial updates, learning modules, and advisory on financial matters</li>
              <li>Comprehensive support for GST filing, reconciliation, and amendments</li>
              <li>Regular updates on financial regulations and policies affecting businesses and individuals</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">2. Eligibility for Services</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>The client must be 18 years or older or have appropriate legal authority to act on behalf of a minor or business entity</li>
              <li>The client must provide accurate and complete information as required for availing of services</li>
              <li>The client must comply with applicable laws and regulations governing their financial transactions</li>
              <li>Clients below 18 years of age can opt for only learning and financial update services</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">3. User Responsibilities</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>Ensure all information and documents shared are accurate, complete, and timely</li>
              <li>Review all reports, returns, or filings for accuracy before final submission</li>
              <li>Retain copies of all submitted documents for personal records</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">4. Confidentiality and Data Protection</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>All client data will be handled in strict confidence and used only for service delivery</li>
              <li>No client information will be shared with third parties except as required by law or with explicit consent</li>
              <li>Security measures will be implemented to protect sensitive client data</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">5. Intellectual Property</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>All materials, tools, and learning modules provided remain the property of the consultancy</li>
              <li>The client may use these materials for personal or internal business purposes only</li>
              <li>Redistribution, resale, or modification of consultancy materials is prohibited without prior consent</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">6. Service Fees and Payment</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>All services are subject to fees as agreed upon in advance</li>
              <li>Fees must be paid promptly as per the invoice or agreement terms</li>
              <li>Non-payment or delayed payment may result in suspension or termination of services</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">7. Refund Policy</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>Fees paid for consultancy services are non-refundable unless explicitly stated otherwise</li>
              <li>Refunds, if applicable, will be processed based on mutual agreement and company policy</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">8. Updates and Learning Modules</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>Regular updates on GST, tax laws, and financial regulations will be provided as part of the service</li>
              <li>Access to learning modules is subject to the terms of the agreement</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">9. Limitations of Liability</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>The consultancy will not be liable for penalties, interest, or other charges resulting from inaccurate or incomplete information provided by the client</li>
              <li>Liability is limited to the service fee paid for the specific issue in question</li>
            </ul>
          </section>

          {/* Section 10 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">10. Termination of Agreement</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>Either party may terminate the agreement with written notice, subject to applicable terms</li>
              <li>Upon termination, the client must settle any outstanding payments</li>
            </ul>
          </section>

          {/* Section 11 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">11. Dispute Resolution</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>All disputes will be subject to the jurisdiction of the courts located in the agreed region, typically where the consultancy operates</li>
            </ul>
          </section>

          {/* Section 12 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">12. Consent to Communications</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>By availing of the services, the client consents to receive communications via email, SMS, and WhatsApp for updates and service-related notifications</li>
            </ul>
          </section>

          {/* Section 13 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">13. Force Majeure</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>The consultancy shall not be liable for delays or failures resulting from events beyond its reasonable control, such as natural disasters, internet outages, or government actions</li>
            </ul>
          </section>

          {/* Section 14 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">14. Intellectual Property Rights</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>All intellectual property associated with Facto Management Consultancy services is owned exclusively by the company</li>
              <li>Clients are not permitted to reproduce, modify, or distribute any proprietary materials without prior written consent</li>
            </ul>
          </section>

          {/* Section 15 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">15. License and Permitted Use</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>Facto Management Consultancy grants clients a limited, non-exclusive, non-transferable license to use its services for the agreed purposes</li>
              <li>The services are to be used only by the client and for the intended scope. Any unauthorized usage, redistribution, or modification of the services is prohibited</li>
            </ul>
          </section>

          {/* Section 16 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">16. Disclaimer of Warranties</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>Facto Management Consultancy provides its services "as is" and does not guarantee specific outcomes or results</li>
              <li>The consultancy is not liable for external factors, such as internet issues or delays caused by regulatory bodies</li>
            </ul>
          </section>

          {/* Section 17 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">17. Calling, SMS, and Email Policy</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>Clients consent to receive calls, SMS, WhatsApp messages, and emails for service-related updates, even if registered on "Do Not Disturb" lists</li>
              <li>Facto Management Consultancy is not liable for complaints under telecommunication regulations for such communications</li>
            </ul>
          </section>

          {/* Section 18 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">18. Electronic Communication Consent</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>By engaging with the services, clients consent to receive all communications electronically, including updates, disclosures, and alerts</li>
            </ul>
          </section>

          {/* Section 19 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">19. Indemnification</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>Clients agree to indemnify and hold Facto Management Consultancy harmless against claims, damages, or liabilities resulting from misuse or breach of these terms</li>
            </ul>
          </section>

          {/* Section 20 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">20. Amendments to Terms and Conditions</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>The consultancy reserves the right to amend these terms and conditions</li>
              <li>Clients will be notified of significant changes via email or updates on the official website</li>
            </ul>
          </section>

          {/* Section 21 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">21. Acknowledgment and Acceptance</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>By availing of the consultancy services, the client acknowledges understanding and acceptance of these terms and conditions</li>
            </ul>
          </section>

          {/* Contact Section */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have any questions about these Terms and Conditions, please contact us:
            </p>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p><strong>Email:</strong> support@facto.in</p>
              <p><strong>Phone:</strong> +91-880-077-2257</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

