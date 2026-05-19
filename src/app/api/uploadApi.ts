import axiosClient from './axiosClient';

export const uploadApi = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};
