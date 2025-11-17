import { memo } from 'react';
import { Service } from '../../api/services';

interface MobileServiceCardProps {
  service: Service;
  onClick: () => void;
}

// Helper function to get service icon
const getServiceIcon = (title: string): string => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('itr') || titleLower.includes('income tax')) return '📊';
  if (titleLower.includes('gst')) return '🏢';
  if (titleLower.includes('investment')) return '📈';
  if (titleLower.includes('tax') || titleLower.includes('consultancy')) return '💡';
  if (titleLower.includes('notice') || titleLower.includes('scrutiny')) return '📋';
  if (titleLower.includes('registration')) return '🏆';
  if (titleLower.includes('outsourcing')) return '💼';
  return '📄';
};

// Helper function to get service color
const getServiceColor = (title: string): string => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('itr') || titleLower.includes('income tax')) return 'from-blue-500 to-blue-600';
  if (titleLower.includes('gst')) return 'from-green-500 to-green-600';
  if (titleLower.includes('investment')) return 'from-purple-500 to-purple-600';
  if (titleLower.includes('tax') || titleLower.includes('consultancy')) return 'from-orange-500 to-orange-600';
  if (titleLower.includes('notice') || titleLower.includes('scrutiny')) return 'from-red-500 to-red-600';
  if (titleLower.includes('registration')) return 'from-indigo-500 to-indigo-600';
  return 'from-teal-500 to-teal-600';
};

export const MobileServiceCard = memo(function MobileServiceCard({ service, onClick }: MobileServiceCardProps) {
  const icon = getServiceIcon(service.title);
  const colorGradient = getServiceColor(service.title);

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-98 transition-transform duration-150 touch-manipulation"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${colorGradient} flex items-center justify-center text-2xl shadow-lg`}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
            {service.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
            {service.description}
          </p>

          {/* Features Preview */}
          {service.features && service.features.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex -space-x-1">
                {service.features.slice(0, 3).map((_feature, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center border-2 border-white dark:border-gray-800"
                  >
                    <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ))}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {service.features.length} features
              </span>
            </div>
          )}

          {/* CTA */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Tap to explore
            </span>
            <svg className="w-5 h-5 text-[#007AFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
});

