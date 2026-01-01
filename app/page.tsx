'use client';
import React, { useState } from 'react';
import { Upload, File, Image, Video, Music, FileText, X, Eye, Play, Download } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  url: string;
  textContent?: string;
}

export default function FileUploader() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [viewingFile, setViewingFile] = useState<UploadedFile | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    
    const newFiles: UploadedFile[] = uploadedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      url: URL.createObjectURL(file)
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isApkFile = (file: UploadedFile) => {
    return file.name.toLowerCase().endsWith('.apk') || 
           file.type === 'application/vnd.android.package-archive';
  };

  const getFileIcon = (file: UploadedFile) => {
    const type = file.type;
    const name = file.name.toLowerCase();
    
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (type.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (name.endsWith('.apk') || type === 'application/vnd.android.package-archive')
      return <FileText className="w-5 h-5 text-green-600" />;
    if (type.startsWith('text/') || type.includes('document') || type.includes('pdf')) 
      return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const renderPreview = (file: UploadedFile) => {
    if (file.type.startsWith('image/')) {
      return (
        <img 
          src={file.url} 
          alt={file.name}
          className="w-full h-48 object-cover rounded-lg"
        />
      );
    }
    
    if (file.type.startsWith('video/')) {
      return (
        <video 
          src={file.url} 
          controls
          className="w-full h-48 rounded-lg bg-black"
        />
      );
    }
    
    if (file.type.startsWith('audio/')) {
      return (
        <div className="flex items-center justify-center h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
          <div className="text-center">
            <Music className="w-16 h-16 mx-auto mb-2 text-purple-600" />
            <p className="text-sm text-gray-600 mt-2">Audio File</p>
          </div>
        </div>
      );
    }

    if (file.type === 'text/plain') {
      return (
        <div className="h-48 bg-gray-50 rounded-lg p-4 overflow-hidden">
          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono line-clamp-6">
            {file.textContent || 'Loading...'}
          </pre>
        </div>
      );
    }

    if (file.type === 'application/pdf' || file.type.includes('pdf')) {
      return (
        <div className="flex items-center justify-center h-48 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg">
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto mb-2 text-red-600" />
            <p className="text-sm text-gray-600 mt-2">PDF Document</p>
          </div>
        </div>
      );
    }

    if (isApkFile(file)) {
      return (
        <div className="flex items-center justify-center h-48 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
          <div className="text-center">
            <FileText className="w-20 h-20 mx-auto mb-2 text-green-600" />
            <p className="text-sm font-semibold text-gray-700 mt-2">Android APK</p>
            <p className="text-xs text-gray-500 mt-1">Download to install</p>
          </div>
        </div>
      );
    }

    if (file.type.includes('document') || file.type.includes('word')) {
      return (
        <div className="flex items-center justify-center h-48 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-gray-600 mt-2">Document</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
        <div className="text-center">
          {getFileIcon(file)}
          <p className="mt-2 text-sm text-gray-600">Preview not available</p>
        </div>
      </div>
    );
  };

  React.useEffect(() => {
    files.forEach(file => {
      if (file.type === 'text/plain' && !file.textContent) {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          setFiles(prev => prev.map(f => 
            f.id === file.id ? {...f, textContent: e.target?.result as string} : f
          ));
        };
        reader.readAsText(file.file);
      }
    });
  }, [files]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Temporary File Uploader
          </h1>
          <p className="text-gray-600">
            Upload any file type including APK • No storage • Clears on refresh
          </p>
        </div>

        <div className="mb-12">
          <label className="block">
            <div className="relative border-4 border-dashed border-blue-400 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-600 hover:bg-blue-50 transition-all duration-200">
              <div className="absolute -top-1 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-2xl"></div>
              <Upload className="w-16 h-16 mx-auto mb-4 text-blue-500" />
              <p className="text-xl font-semibold text-gray-700 mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                Images, videos, documents, audio, APK files, and more
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept="*/*"
              />
            </div>
          </label>
        </div>

        {files.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Uploaded Files ({files.length})
              </h2>
              <button
                onClick={() => {
                  files.forEach(f => URL.revokeObjectURL(f.url));
                  setFiles([]);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="relative">
                    {renderPreview(file)}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {(file.type.startsWith('image/') || 
                      file.type.startsWith('video/') || 
                      file.type === 'text/plain' ||
                      file.type.includes('pdf') ||
                      isApkFile(file) ||
                      file.type.includes('document')) && (
                      <button
                        onClick={() => setViewingFile(file)}
                        className="absolute top-2 left-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
                        title="View file"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    {file.type.startsWith('audio/') && (
                      <button
                        onClick={() => setPlayingAudio(playingAudio === file.id ? null : file.id)}
                        className="absolute top-2 left-2 p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-lg"
                        title="Play audio"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-gray-600 mt-1">
                        {getFileIcon(file)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatFileSize(file.size)}
                        </p>
                        {isApkFile(file) && (
                          <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                            APK File
                          </span>
                        )}
                      </div>
                    </div>
                    {playingAudio === file.id && file.type.startsWith('audio/') && (
                      <div className="mt-3 pt-3 border-t">
                        <audio 
                          src={file.url} 
                          controls 
                          autoPlay 
                          className="w-full"
                          onEnded={() => setPlayingAudio(null)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {files.length === 0 && (
          <div className="text-center py-16">
            <File className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              No files uploaded yet. Start by uploading some files above.
            </p>
          </div>
        )}

        {viewingFile && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setViewingFile(null)}
          >
            <div 
              className="bg-white rounded-2xl max-w-5xl max-h-[90vh] w-full overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  {getFileIcon(viewingFile)}
                  <div>
                    <h3 className="font-bold text-lg">{viewingFile.name}</h3>
                    <p className="text-sm text-gray-500">{formatFileSize(viewingFile.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingFile(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                {viewingFile.type.startsWith('image/') && (
                  <img 
                    src={viewingFile.url} 
                    alt={viewingFile.name}
                    className="w-full h-auto rounded-lg"
                  />
                )}
                
                {viewingFile.type.startsWith('video/') && (
                  <video 
                    src={viewingFile.url} 
                    controls
                    className="w-full rounded-lg"
                    autoPlay
                  />
                )}
                
                {viewingFile.type.startsWith('audio/') && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Music className="w-24 h-24 mb-6 text-purple-600" />
                    <audio src={viewingFile.url} controls className="w-full max-w-md" autoPlay />
                  </div>
                )}

                {viewingFile.type === 'text/plain' && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {viewingFile.textContent || 'Loading...'}
                    </pre>
                  </div>
                )}

                {(viewingFile.type === 'application/pdf' || 
                  viewingFile.type.includes('pdf')) && (
                  <div className="w-full h-[600px]">
                    <iframe
                      src={viewingFile.url}
                      className="w-full h-full rounded-lg border"
                      title={viewingFile.name}
                    />
                  </div>
                )}

                {(viewingFile.type.includes('document') || 
                  viewingFile.type.includes('word') || 
                  viewingFile.type.includes('msword') ||
                  viewingFile.type.includes('officedocument')) && (
                  <div className="text-center py-12">
                    <FileText className="w-24 h-24 mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-700 mb-2 text-lg font-semibold">{viewingFile.name}</p>
                    <p className="text-gray-500 mb-6">Document preview not supported in browser</p>
                    <a
                      href={viewingFile.url}
                      download={viewingFile.name}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Download Document
                    </a>
                  </div>
                )}

                {isApkFile(viewingFile) && (
                  <div className="text-center py-12">
                    <FileText className="w-24 h-24 mx-auto mb-4 text-green-600" />
                    <p className="text-gray-700 mb-2 text-lg font-semibold">{viewingFile.name}</p>
                    <p className="text-gray-500 mb-6">Android APK file - Download and install on your Android device</p>
                    
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6 max-w-md mx-auto text-left">
                      <p className="text-sm text-yellow-800 font-semibold mb-2">📱 Installation Instructions:</p>
                      <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                        <li>Download the APK file</li>
                        <li>Transfer to your Android phone</li>
                        <li>Enable "Install from Unknown Sources" in Settings</li>
                        <li>Open the APK file to install</li>
                      </ol>
                      <p className="text-xs text-yellow-700 mt-3">
                        ⚠️ Only install APK files from trusted sources
                      </p>
                    </div>
                    
                    <a
                      href={viewingFile.url}
                      download={viewingFile.name}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                    >
                      <Download className="w-5 h-5" />
                      Download APK
                    </a>
                  </div>
                )}

                {!viewingFile.type.startsWith('image/') && 
                 !viewingFile.type.startsWith('video/') && 
                 !viewingFile.type.startsWith('audio/') && 
                 viewingFile.type !== 'text/plain' &&
                 !viewingFile.type.includes('pdf') &&
                 !viewingFile.type.includes('document') &&
                 !viewingFile.type.includes('word') &&
                 !viewingFile.type.includes('officedocument') &&
                 !isApkFile(viewingFile) && (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 text-gray-400 flex items-center justify-center">
                      {getFileIcon(viewingFile)}
                    </div>
                    <p className="text-gray-700 mb-2 text-lg font-semibold">{viewingFile.name}</p>
                    <p className="text-gray-500 mb-6">Preview not available for this file type</p>
                    <a
                      href={viewingFile.url}
                      download={viewingFile.name}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Download File
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}