import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import supabase from '../lib/supabase';

const ImageUpload = ({ onImageUpload, currentImageUrl = null }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    const handleFileUpload = async (file) => {
        // Clear previous errors
        setError(null);

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file (JPEG, PNG, GIF, etc.)');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Check if user is authenticated using custom auth system
            const userSession = localStorage.getItem('user_session');
            
            if (!userSession) {
                setError('Please login as staff first to upload images.');
                setIsUploading(false);
                return;
            }

            let userData;
            try {
                userData = JSON.parse(userSession);
            } catch (error) {
                setError('Invalid session data. Please login again.');
                setIsUploading(false);
                return;
            }

            if (!userData || !userData.id) {
                setError('Authentication required. Please login as staff.');
                setIsUploading(false);
                return;
            }

            // Check if user has staff role
            if (userData.role !== 'staff') {
                setError('Staff access required to upload images.');
                setIsUploading(false);
                return;
            }

            console.log('User authenticated:', userData.email);
            console.log('User ID:', userData.id);
            console.log('User role:', userData.role);

            // Create a unique filename with staff prefix
            const fileExt = file.name.split('.').pop();
            const fileName = `menu-${Date.now()}-${userData.email_name || userData.id}-${file.name}`;
            const filePath = `${fileName}`;

            console.log('Uploading file:', filePath);
            console.log('File will be uploaded by staff:', userData.email_name);

            // Upload to Supabase Storage
            console.log('Attempting upload to product-menu bucket...');
            console.log('File path:', filePath);
            console.log('File size:', file.size, 'bytes');
            console.log('File type:', file.type);
            
            const { data, error: uploadError } = await supabase.storage
                .from('product-menu')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('Upload error details:', uploadError);
                console.error('Error status:', uploadError.statusCode);
                console.error('Error message:', uploadError.message);
                
                if (uploadError.message.includes('bucket') || uploadError.message.includes('not found')) {
                    throw new Error('Storage bucket not found. Please create the "product-menu" bucket in your Supabase dashboard.');
                }
                if (uploadError.message.includes('RLS') || uploadError.message.includes('policy') || uploadError.message.includes('Unauthorized')) {
                    throw new Error('Storage permissions issue. Please run the SQL command in Supabase SQL Editor to fix RLS policies. Error: ' + uploadError.message);
                }
                throw uploadError;
            }

            // Get the public URL
            const { data: { publicUrl } } = supabase.storage
                .from('product-menu')
                .getPublicUrl(filePath);

            console.log('Upload successful! Public URL:', publicUrl);

            setPreviewUrl(publicUrl);
            onImageUpload(publicUrl);
            setUploadProgress(100);
            setSuccess(true);
            setError(null);
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);

        } catch (error) {
            console.error('Upload error:', error);
            setError(error.message || 'Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const removeImage = () => {
        setPreviewUrl(null);
        onImageUpload('');
        setError(null);
        setSuccess(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="w-full">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700">{error}</span>
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-700">Image uploaded successfully!</span>
                </div>
            )}

            {/* Upload Area */}
            {!previewUrl ? (
                <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDragging
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <div className="text-sm text-gray-600">
                        <p className="font-medium">
                            {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF up to 5MB
                        </p>
                    </div>
                    
                    {/* Upload Progress */}
                    {isUploading && (
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
                        </div>
                    )}
                </div>
            ) : (
                /* Image Preview */
                <div className="relative group">
                    <img
                        src={previewUrl}
                        alt="Product preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X size={16} />
                    </button>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                        <ImageIcon className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUpload; 