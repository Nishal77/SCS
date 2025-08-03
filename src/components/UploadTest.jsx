import React, { useState } from 'react';
import ImageUpload from './ImageUpload';

const UploadTest = () => {
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Image Upload Test</h2>
            
            <ImageUpload
                onImageUpload={(imageUrl) => {
                    setUploadedImageUrl(imageUrl);
                    console.log('Uploaded image URL:', imageUrl);
                }}
                currentImageUrl={uploadedImageUrl}
            />
            
            {uploadedImageUrl && (
                <div className="mt-4">
                    <h3 className="font-semibold mb-2">Uploaded Image URL:</h3>
                    <p className="text-sm text-gray-600 break-all">{uploadedImageUrl}</p>
                </div>
            )}
        </div>
    );
};

export default UploadTest; 