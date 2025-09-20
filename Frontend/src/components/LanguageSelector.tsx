import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex space-x-2">
      <select
        className="bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
      >
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
        <option value="pa">ਪੰਜਾਬੀ</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
