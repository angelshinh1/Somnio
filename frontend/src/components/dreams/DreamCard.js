export default function DreamCard({ dream, onEdit, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getEmotionColor = (emotion) => {
    const emotions = {
      'happy': 'from-yellow-100 to-yellow-200 text-yellow-800',
      'peaceful': 'from-blue-100 to-blue-200 text-blue-800',
      'anxious': 'from-red-100 to-red-200 text-red-800',
      'exciting': 'from-purple-100 to-purple-200 text-purple-800',
      'mysterious': 'from-indigo-100 to-indigo-200 text-indigo-800',
      'sad': 'from-gray-100 to-gray-200 text-gray-800',
      'neutral': 'from-neutral-100 to-neutral-200 text-neutral-800'
    };
    return emotions[emotion] || emotions['neutral'];
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-neutral-200/50">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-800 mb-2 line-clamp-2">
            {dream.title}
          </h3>
          <div className="flex items-center space-x-3 text-sm text-neutral-500">
            <span>{formatDate(dream.date)}</span>
            {dream.lucidDream && (
              <span className="bg-accent-100 text-accent-700 px-2 py-1 rounded-full text-xs font-medium">
                ✨ Lucid
              </span>
            )}
            {dream.recurring && (
              <span className="bg-secondary-100 text-secondary-700 px-2 py-1 rounded-full text-xs font-medium">
                🔄 Recurring
              </span>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        {(onEdit || onDelete) && (
          <div className="flex space-x-2 ml-4">
            {onEdit && (
              <button
                onClick={() => onEdit(dream)}
                className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(dream)}
                className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-neutral-600 text-sm leading-relaxed mb-4 line-clamp-3">
        {dream.description}
      </p>

      {/* Tags and Emotion */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {dream.tags && dream.tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full text-xs font-medium"
          >
            #{tag}
          </span>
        ))}
        {dream.tags && dream.tags.length > 3 && (
          <span className="text-neutral-400 text-xs">
            +{dream.tags.length - 3} more
          </span>
        )}
      </div>

      {/* Emotion Badge */}
      {dream.emotion && (
        <div className="flex justify-between items-center">
          <span className={`bg-gradient-to-r ${getEmotionColor(dream.emotion)} px-3 py-1 rounded-full text-xs font-medium capitalize`}>
            {dream.emotion}
          </span>
          
          {/* Privacy indicator */}
          <div className="text-xs text-neutral-400 flex items-center space-x-1">
            {dream.isPublic ? (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Public</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Private</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}