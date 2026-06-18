import { useCookies } from "react-cookie";

function useAuth() {
    const [cookies, setCookie, removeCookie] = useCookies(['token'], {
        doNotParse: true,
    });

    return cookies;
}

export default useAuth;