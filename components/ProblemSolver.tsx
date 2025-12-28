
import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Send, X, FileText, Languages, Crop, RotateCcw, Maximize, Square, Minus, Plus, RefreshCw } from 'lucide-react';
import Cropper, { Point, Area } from 'react-easy-crop';
import { Button } from './Button';
import { solveMathProblem } from '../services/gemini';
import { addProblem } from '../services/storage';
import { User, MathProblem } from '../types';

interface ProblemSolverProps {
  user: User;
  onSuccess: () => void;
}

// Helper to create an image element from URL
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

// Helper for degree to radian conversion
function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

// Helper to get cropped image as base64 with rotation support
const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<string> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  const rotRad = getRadianAngle(rotation);

  // calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // translate canvas context to a central point to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // draw rotated image
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) return '';

  // Set the size of the real cropped canvas
  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  // Draw the section of the main canvas onto the cropped canvas
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return croppedCanvas.toDataURL('image/jpeg');
};

export const ProblemSolver: React.FC<ProblemSolverProps> = ({ user, onSuccess }) => {
  const [image, setImage] = useState<string | null>(null);
  const [textQuery, setTextQuery] = useState('');
  const [isSolving, setIsSolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'English' | 'Malay'>('English');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropping state
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please upload a valid image.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setTempImage(result);
        setShowCropper(true);
        setRotation(0);
        setZoom(1);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_: Area, b: Area) => {
    setCroppedAreaPixels(b);
  }, []);

  const handleApplyCrop = async () => {
    if (tempImage && croppedAreaPixels) {
      try {
        const croppedBase64 = await getCroppedImg(tempImage, croppedAreaPixels, rotation);
        setImage(croppedBase64);
        setShowCropper(false);
        setTempImage(null);
      } catch (e) {
        console.error(e);
        setError("Could not crop image. Please try again.");
      }
    }
  };

  const handleZoomOut = () => setZoom(prev => Math.max(1, prev - 0.2));
  const handleZoomIn = () => setZoom(prev => Math.min(3, prev + 0.2));
  const handleResetCrop = () => {
    setZoom(1);
    setRotation(0);
    setCrop({ x: 0, y: 0 });
  };

  const clearImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSolve = async () => {
    if (!image && !textQuery.trim()) {
      setError("Please provide a photo or type your problem.");
      return;
    }

    setIsSolving(true);
    setError(null);

    try {
      const solution = await solveMathProblem(image || undefined, textQuery || undefined, language);
      
      const newProblem: MathProblem = {
        problemId: Date.now().toString(),
        userId: user.userId,
        imageUrl: image || undefined,
        questionText: textQuery || undefined,
        solution: solution || "No solution generated.",
        language,
        submissionTime: new Date().toISOString(),
      };

      addProblem(newProblem);
      setImage(null);
      setTextQuery('');
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Network error occurred. Please try again.");
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      {/* Cropper Modal Overlay */}
      {showCropper && tempImage && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black/95 p-4 sm:p-8 overflow-y-auto">
          <div className="relative flex-1 min-h-[400px] bg-gray-900 rounded-2xl overflow-hidden">
            <Cropper
              image={tempImage}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              onCropChange={setCrop}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          
          <div className="mt-6 space-y-6 bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Controls Column 1: Zoom & Rotation */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-white text-xs font-semibold mb-1 uppercase tracking-wider opacity-70">
                    <div className="flex items-center gap-2">
                      <label>Zoom</label>
                      <button onClick={handleResetCrop} className="p-1 hover:text-white transition-colors" title="Reset View">
                        <RefreshCw size={12} />
                      </button>
                    </div>
                    <span>{zoom.toFixed(1)}x</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={handleZoomOut} className="p-1 text-gray-300 hover:text-white transition-colors">
                      <Minus size={18} />
                    </button>
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      aria-labelledby="Zoom"
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <button onClick={handleZoomIn} className="p-1 text-gray-300 hover:text-white transition-colors">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-white text-xs font-semibold mb-1 uppercase tracking-wider opacity-70">
                    <label>Rotation</label>
                    <span>{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    value={rotation}
                    min={0}
                    max={360}
                    step={1}
                    aria-labelledby="Rotation"
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>

              {/* Controls Column 2: Aspect Ratio (Resizing Logic) */}
              <div className="space-y-3">
                <p className="text-white text-xs font-semibold uppercase tracking-wider opacity-70">Frame Shape</p>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setAspect(undefined)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${aspect === undefined ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                  >
                    <Maximize size={14} /> Free
                  </button>
                  <button 
                    onClick={() => setAspect(1)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${aspect === 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                  >
                    <Square size={14} /> 1:1
                  </button>
                  <button 
                    onClick={() => setAspect(4/3)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${aspect === 4/3 ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                  >
                    4:3
                  </button>
                  <button 
                    onClick={() => setAspect(16/9)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${aspect === 16/9 ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                  >
                    16:9
                  </button>
                </div>
              </div>

              {/* Controls Column 3: Actions */}
              <div className="flex items-center justify-end gap-3">
                <Button 
                  variant="outline" 
                  className="text-white border-white/20 hover:bg-white/10 bg-transparent"
                  onClick={() => { setShowCropper(false); setTempImage(null); }}
                >
                  Cancel
                </Button>
                <Button onClick={handleApplyCrop} className="px-8 bg-blue-600 hover:bg-blue-500 text-white">
                  Confirm Crop
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-blue-600" /> Solve a Problem
        </h2>
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg">
          <button 
            onClick={() => setLanguage('English')}
            className={`px-3 py-1 text-sm rounded-md transition-all ${language === 'English' ? 'bg-white shadow-sm text-blue-600 font-semibold' : 'text-gray-500'}`}
          >
            English
          </button>
          <button 
            onClick={() => setLanguage('Malay')}
            className={`px-3 py-1 text-sm rounded-md transition-all ${language === 'Malay' ? 'bg-white shadow-sm text-blue-600 font-semibold' : 'text-gray-500'}`}
          >
            Bahasa Melayu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Photo Upload Area */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Snap or Upload Photo</label>
          {image ? (
            <div className="relative group rounded-xl overflow-hidden border-2 border-blue-100 bg-white">
              <img src={image} alt="Problem preview" className="w-full h-48 object-contain" />
              <div className="absolute top-2 right-2 flex gap-2">
                <button 
                  onClick={() => { setTempImage(image); setShowCropper(true); }}
                  className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
                  title="Re-crop"
                >
                  <Crop size={16} />
                </button>
                <button 
                  onClick={clearImage}
                  className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 hover:border-blue-400 transition-all group"
            >
              <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                <Camera className="text-blue-600" size={24} />
              </div>
              <p className="mt-3 text-sm text-gray-500 font-medium">Click to upload or take a photo</p>
              <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG</p>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Text Area */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Or Type Problem Text</label>
          <textarea 
            value={textQuery}
            onChange={(e) => setTextQuery(e.target.value)}
            placeholder="E.g. Solve the equation 2x^2 + 5x - 3 = 0"
            className="w-full h-48 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-gray-700"
          ></textarea>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
          <span className="font-bold">Error:</span> {error}
        </div>
      )}

      <div className="flex justify-end pt-2 border-t border-gray-50">
        <Button 
          onClick={handleSolve} 
          isLoading={isSolving}
          className="w-full md:w-auto px-10 gap-2"
        >
          <Send size={18} /> Solve with AI
        </Button>
      </div>
      
      {isSolving && (
        <p className="text-center text-xs text-gray-400 animate-pulse">
          Analyzing SPM Syllabus concepts... (Estimated time: &lt; 30s)
        </p>
      )}
    </div>
  );
};
