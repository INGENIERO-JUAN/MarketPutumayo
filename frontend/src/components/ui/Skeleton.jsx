/**
 * Skeleton — placeholder de carga tipo skeleton screen
 *
 * @param {'text'|'card'|'avatar'|'button'|'image'} type
 * @param {string} className
 * @param {number} lines - solo para type='text'
 */

const pulse = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';

const Skeleton = ({ type = 'text', lines = 3, className = '' }) => {
  if (type === 'avatar') {
    return <div className={`${pulse} rounded-full w-12 h-12 ${className}`} />;
  }

  if (type === 'button') {
    return <div className={`${pulse} h-10 w-28 rounded-lg ${className}`} />;
  }

  if (type === 'image') {
    return <div className={`${pulse} w-full h-48 ${className}`} />;
  }

  if (type === 'card') {
    return (
      <div className={`bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm ${className}`}>
        <div className={`${pulse} h-44 rounded-none`} />
        <div className="p-4 space-y-3">
          <div className={`${pulse} h-4 w-3/4`} />
          <div className={`${pulse} h-3 w-full`} />
          <div className={`${pulse} h-3 w-5/6`} />
          <div className="flex justify-between items-center pt-2">
            <div className={`${pulse} h-5 w-20`} />
            <div className={`${pulse} h-8 w-24 rounded-lg`} />
          </div>
        </div>
      </div>
    );
  }

  // text (default)
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`${pulse} h-3 rounded`}
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
};

export default Skeleton;
