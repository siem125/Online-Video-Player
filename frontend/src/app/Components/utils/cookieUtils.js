// utils/cookieUtils.js

// Function to set a cookie
  export const setCookie = (name, value, days) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  };
  
  // Function to get the value of a specific cookie
  export const getCookie = (name) => {
    if(typeof document !== 'undefined'){
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
          return cookie.substring(name.length + 1);
        }
      }
    }
    return null;
  };

  // Function to remove a specific cookie
export const removeCookie = (name) => {
  const date = new Date();
  date.setTime(date.getTime() - (24 * 60 * 60 * 1000)); // Set to past date to expire the cookie
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=;" + expires + ";path=/";
};