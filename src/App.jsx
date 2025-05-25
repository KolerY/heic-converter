import { useState, useCallback } from 'react'
import { LuUpload } from 'react-icons/lu'
import { ArrowDownTrayIcon, XMarkIcon } from '@heroicons/react/24/outline'
import heic2any from 'heic2any'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function App() {
  const [files, setFiles] = useState([])
  const [converting, setConverting] = useState(false)
  const [convertedFiles, setConvertedFiles] = useState([])
  const [error, setError] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(file =>
      file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heic')
    )
    setFiles(prev => [...prev, ...selectedFiles])
    setError(null)
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file =>
      file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heic')
    )
    setFiles(prev => [...prev, ...droppedFiles])
  }, [])

  const convertToJpg = async () => {
    if (files.length === 0) return

    setConverting(true)
    setError(null)
    const newConvertedFiles = []

    for (const file of files) {
      try {
        const jpgBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.9
        })

        const url = URL.createObjectURL(jpgBlob)
        const newFileName = file.name.replace(/\.heic$/i, '.jpg')

        newConvertedFiles.push({
          name: newFileName,
          url: url,
          size: jpgBlob.size
        })
      } catch (error) {
        console.error('Error converting file:', error)
        setError('Failed to convert one or more files. Please try again.')
      }
    }

    setConvertedFiles(newConvertedFiles)
    setConverting(false)
  }

  const downloadFile = (file) => {
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl text-center">HEIC to JPG Converter</CardTitle>
          <CardDescription className="text-center">Convert your HEIC images to JPG format easily</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 transition-colors duration-200 mx-auto w-full bg-white shadow-sm ${isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400'
              }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <LuUpload className="h-6 w-6 text-blue-400 mb-2" />
            <label className="relative cursor-pointer text-blue-600 hover:underline mb-2">
              <input
                type="file"
                multiple
                accept=".heic,.HEIC"
                onChange={handleFileChange}
                className="hidden"
              />
              Select HEIC Files
            </label>
            <p className="text-sm text-gray-500 text-center">
              or drag and drop your files here
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mt-4">
              {error}
            </div>
          )}

          {files.length > 0 && (
            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Selected Files ({files.length})
                </h2>
                <Button
                  onClick={convertToJpg}
                  disabled={converting}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {converting ? 'Converting...' : 'Convert to JPG'}
                </Button>
              </div>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-lg group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-500">
                        <LuUpload className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {convertedFiles.length > 0 && (
            <div className="space-y-4 mt-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Converted Files
              </h2>
              <div className="space-y-2">
                {convertedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-lg group hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-green-500">
                        <LuUpload className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => downloadFile(file)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
                    >
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default App
