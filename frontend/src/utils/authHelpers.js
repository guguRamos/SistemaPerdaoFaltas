export function getAuthToken() {
    return localStorage.getItem("ACCESS_TOKEN") || null;
  }
  
  export function getUserRole() {
    return localStorage.getItem("user_role") || null;
  }
  