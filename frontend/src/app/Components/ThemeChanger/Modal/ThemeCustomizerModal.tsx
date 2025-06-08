import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';

const ThemeCustomizerModal: React.FC = () => {
  const { customTheme, setCustomTheme } = useTheme();

  // Initialize state with values from customTheme or fallback to CSS variables
  const [siteBgColor, setSiteBgColor] = useState(customTheme['site-bg-color'] || '');
  const [siteTextColor, setSiteTextColor] = useState(customTheme['site-text-color'] || '');
  const [siteHeadingColor, setSiteHeadingColor] = useState(customTheme['site-heading-color'] || '');
  const [siteOutlineColor, setSiteOutlineColor] = useState(customTheme['site-outline-color'] || '');
  const [navBgColor, setNavBgColor] = useState(customTheme['nav-bg-color'] || '');
  const [navTextColor, setNavTextColor] = useState(customTheme['nav-text-color'] || '');
  const [navHoverColor, setNavHoverColor] = useState(customTheme['nav-hover-color'] || '');
  const [navHoverTextColor, setNavHoverTextColor] = useState(customTheme['nav-hoverText-color'] || '');
  const [navHighlightedColor, setNavHighlightedColor] = useState(customTheme['nav-highlighted-color'] || '');
  const [navOptionMenuBgColor, setNavOptionMenuBgColor] = useState(customTheme['nav-optionMenuBg-color'] || '');

  useEffect(() => {
    // Fetch CSS variables if no custom theme values are set
    const rootStyles = getComputedStyle(document.documentElement);

    if (!customTheme['site-bg-color']) setSiteBgColor(rootStyles.getPropertyValue('--site-bg-color').trim());
    if (!customTheme['site-text-color']) setSiteTextColor(rootStyles.getPropertyValue('--site-text-color').trim());
    if (!customTheme['site-heading-color']) setSiteHeadingColor(rootStyles.getPropertyValue('--site-heading-color').trim());
    if (!customTheme['site-outline-color']) setSiteOutlineColor(rootStyles.getPropertyValue('--site-outline-color').trim());
    if (!customTheme['nav-bg-color']) setNavBgColor(rootStyles.getPropertyValue('--nav-bg-color').trim());
    if (!customTheme['nav-text-color']) setNavTextColor(rootStyles.getPropertyValue('--nav-text-color').trim());
    if (!customTheme['nav-hover-color']) setNavHoverColor(rootStyles.getPropertyValue('--nav-hover-color').trim());
    if (!customTheme['nav-hoverText-color']) setNavHoverTextColor(rootStyles.getPropertyValue('--nav-hoverText-color').trim());
    if (!customTheme['nav-highlighted-color']) setNavHighlightedColor(rootStyles.getPropertyValue('--nav-highlighted-color').trim());
    if (!customTheme['nav-optionMenuBg-color']) setNavOptionMenuBgColor(rootStyles.getPropertyValue('--nav-optionMenuBg-color').trim());
  }, [customTheme]); // Only rerun if customTheme changes

  const handleSave = () => {
    setCustomTheme({
      'site-bg-color': siteBgColor,
      'site-text-color': siteTextColor,
      'site-heading-color': siteHeadingColor,
      'site-outline-color': siteOutlineColor,
      'nav-bg-color': navBgColor,
      'nav-text-color': navTextColor,
      'nav-hover-color': navHoverColor,
      'nav-hoverText-color': navHoverTextColor,
      'nav-highlighted-color': navHighlightedColor,
      'nav-optionMenuBg-color': navOptionMenuBgColor,
    });
  };

  return (
    <div className="p-4 flex flex-col">
      <div className="flex">
        {/* Site Options on the Left */}
        <div className="w-1/2 pr-4 border-r">
          <h2 className="text-lg font-bold" style={{ color: siteHeadingColor }}>Site Customization</h2>
          <div className="my-4">
            <label>Background Color:</label>
            <input type="color" value={siteBgColor} onChange={(e) => setSiteBgColor(e.target.value)} className="ml-2" />
          </div>
          <div className="my-4">
            <label>Text Color:</label>
            <input type="color" value={siteTextColor} onChange={(e) => setSiteTextColor(e.target.value)} className="ml-2" />
          </div>
          <div className="my-4">
            <label>Heading Color:</label>
            <input type="color" value={siteHeadingColor} onChange={(e) => setSiteHeadingColor(e.target.value)} className="ml-2" />
          </div>
          <div className="my-4">
            <label>Outline Color:</label>
            <input type="color" value={siteOutlineColor} onChange={(e) => setSiteOutlineColor(e.target.value)} className="ml-2" />
          </div>
        </div>

        {/* Nav Options on the Right */}
        <div className="w-1/2 pl-4">
          <h2 className="text-lg font-bold" style={{ color: siteHeadingColor }}>Nav Customization</h2>
          <div className="my-4">
            <label>Background Color:</label>
            <input type="color" value={navBgColor} onChange={(e) => setNavBgColor(e.target.value)} className="ml-2" />
          </div>
          <div className="my-4">
            <label>Text Color:</label>
            <input type="color" value={navTextColor} onChange={(e) => setNavTextColor(e.target.value)} className="ml-2" />
          </div>
          <div className="my-4">
            <label>Hover Color:</label>
            <input type="color" value={navHoverColor} onChange={(e) => setNavHoverColor(e.target.value)} className="ml-2" />
          </div>
          <div className="my-4">
            <label>Hover Text Color:</label>
            <input type="color" value={navHoverTextColor} onChange={(e) => setNavHoverTextColor(e.target.value)} className="ml-2" />
          </div>
          <div className="my-4">
            <label>Highlighted Color:</label>
            <input type="color" value={navHighlightedColor} onChange={(e) => setNavHighlightedColor(e.target.value)} className="ml-2" />
          </div>
          <div className="my-4">
            <label>Option Menu Background:</label>
            <input type="color" value={navOptionMenuBgColor} onChange={(e) => setNavOptionMenuBgColor(e.target.value)} className="ml-2" />
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md self-center">Save Theme</button>
    </div>
  );
};

export default ThemeCustomizerModal;
