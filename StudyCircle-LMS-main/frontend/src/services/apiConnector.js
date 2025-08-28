import axios from "axios"

export const axiosInstance = axios.create({});

export const apiConnector = (method, url, bodyData, headers, params) => {
    // Check if bodyData is FormData
    const isFormData = bodyData instanceof FormData;
    
    // For FormData, don't set Content-Type header - let the browser set it with boundary
    let finalHeaders = headers;
    if (isFormData && headers && headers['Content-Type']) {
        finalHeaders = { ...headers };
        delete finalHeaders['Content-Type'];
    }
    
    return axiosInstance({
        method: `${method}`,
        url: `${url}`,
        data: bodyData ? bodyData : null,
        headers: finalHeaders ? finalHeaders : null,
        params: params ? params : null,
        // Add timeout and other options for file uploads
        timeout: isFormData ? 60000 : 10000, // 60 seconds for file uploads
        maxContentLength: isFormData ? Infinity : undefined,
        maxBodyLength: isFormData ? Infinity : undefined,
    });
}