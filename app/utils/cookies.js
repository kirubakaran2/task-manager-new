import Cookies from 'js-cookie'; // Or your plain JavaScript cookie functions

export const getCookie = (name) => {
  return Cookies.get(name);
};
console.log(getCookie('token'));

export const setCookie = (name, value, options) => {
  Cookies.set(name, value, options);
};
export const removeCookie = (name,value, options) => {
  Cookies.remove(name,value, options);
};