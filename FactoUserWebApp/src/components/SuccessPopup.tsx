
interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  serviceName: string;
  purchaseId: string;
  amount?: number;
  currency?: string;
}

export function SuccessPopup({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  serviceName, 
  purchaseId,
  amount,
  currency = 'INR'
}: SuccessPopupProps) {
  if (!isOpen) return null;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount); // Amount is already in rupees
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        {/* Header with success icon */}
        <div className="text-center pt-8 pb-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-10 h-10 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-lg">{message}</p>
        </div>

        {/* Service details card */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg mx-6 mb-6 p-6 border border-green-200">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Service:</span>
              <span className="text-sm font-semibold text-gray-900">{serviceName}</span>
            </div>
            
            {amount && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Amount:</span>
                <span className="text-sm font-bold text-green-600">{formatAmount(amount)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Purchase ID:</span>
              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {purchaseId}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-6 pb-6 space-y-3">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Continue to Dashboard
          </button>
          
          <button
            onClick={() => {
              // Copy purchase ID to clipboard
              navigator.clipboard.writeText(purchaseId);
              alert('Purchase ID copied to clipboard!');
            }}
            className="w-full bg-gray-100 text-gray-700 py-2 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
          >
            Copy Purchase ID
          </button>
        </div>

        {/* Footer note */}
        <div className="px-6 pb-4">
          <p className="text-xs text-gray-500 text-center">
            You can view your purchased services in your profile dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SuccessPopup;

