import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, UserCheck, Scan, RefreshCw, CheckCircle } from "lucide-react";
import { useToast } from "../hooks/useToast";

interface DetectedFace {
  name: string;
  rollNumber: string;
  spoofed: boolean;
  emotion: string;
}

const CameraAttendance = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  
  const userNameRef = useRef<HTMLInputElement>(null);
  
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [markedStudents, setMarkedStudents] = useState<Set<string>>(new Set());
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  const periods = [
    "1st Period (9:00-10:00)",
    "2nd Period (10:00-11:00)",
    "3rd Period (11:00-12:00)",
    "4th Period (12:00-1:00)",
    "5th Period (2:00-3:00)",
    "6th Period (3:00-4:00)"
  ];

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const drawFrameOnCanvas = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      try {
        // Only draw if video is actually playing
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            // Draw the current video frame
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            console.log('Frame drawn to canvas:', canvas.width, 'x', canvas.height);
          } else {
            console.error('Failed to get canvas context');
          }
        } else {
          console.log('Video not ready:', video.readyState);
        }
      } catch (error) {
        console.error('Error drawing to canvas:', error);
      }
    } else {
      console.error('Video or canvas not found:', { video: !!video, canvas: !!canvas });
    }
    // Continue the animation loop
    animationFrameId.current = requestAnimationFrame(drawFrameOnCanvas);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log("Camera stream started successfully.");
          videoRef.current?.play();
          setIsStreamActive(true);
          animationFrameId.current = requestAnimationFrame(drawFrameOnCanvas);
          showToast('success', 'Camera Started', 'Ready for face detection');
        };
      } else {
        console.error("videoRef.current was not found in the DOM.");
      }
    } catch (error: any) {
      console.error("The request to access the camera failed.", error);
      alert(`Could not access camera. Error: ${error.name}\n\nMessage: ${error.message}`);
      setIsStreamActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    setIsStreamActive(false);
    setDetectedFaces([]);
    setIsScanning(false);
  };

  const startScanning = async () => {
    if (!currentPeriod) {
      showToast('warning', 'Period Required', 'Please select a period first');
      return;
    }

    if (!videoRef.current?.srcObject) {
      showToast('error', 'Camera Not Active', 'Please start the camera first');
      return;
    }

    setIsScanning(true);
    setDetectedFaces([]);
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!canvas || !video) {
      showToast('error', 'Error', 'Video or canvas element not found.');
      setIsScanning(false);
      return;
    }

    try {
      // Ensure video is ready and playing
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        showToast('error', 'Video Not Ready', 'Please wait for the camera to initialize fully');
        setIsScanning(false);
        return;
      }

      // Draw the current frame to canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        showToast('error', 'Canvas Error', 'Could not get canvas context');
        setIsScanning(false);
        return;
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      const imageBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));

      if (!imageBlob) {
        showToast('error', 'Capture Failed', 'Failed to capture image from camera. Please ensure the camera is active and try again.');
        setIsScanning(false);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(imageBlob);

      reader.onloadend = async () => {
        const base64Image = (reader.result as string).split(',')[1];
        
        try {
          // Import the API service
          const apiService = (await import('../utils/api')).default;
          
          // Use the API service to recognize faces
          const result = await apiService.recognizeFace(base64Image);
          
          if (result.success && result.detectedFaces.length > 0) {
            setDetectedFaces(result.detectedFaces);
            showToast('success', 'Faces Detected', `Found ${result.detectedFaces.length} students`);
          } else {
            setDetectedFaces([]);
            showToast('info', 'No Faces Found', result.message || 'No recognizable faces were detected.');
          }
        } catch (error: any) {
          console.error("API call failed:", error);
          showToast('error', 'API Error', error.message || 'An unexpected error occurred during scanning.');
        } finally {
          setIsScanning(false);
        }
      };
      
      reader.onerror = () => {
        showToast('error', 'File Read Error', 'FileReader failed to process the image.');
        setIsScanning(false);
      };

    } catch (error) {
      console.error("Scanning error:", error);
      showToast('error', 'Scanning Failed', 'An unexpected error occurred during scanning. Please try again.');
      setIsScanning(false);
    }
  };

  const markAllAttendance = () => {
    showToast('info', 'Attendance Handled', 'Attendance is automatically marked upon successful face detection and recognition.');
  };

  const retryDetection = () => {
    setDetectedFaces([]);
    setMarkedStudents(new Set());
    startScanning();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold">Camera Attendance</h1>
              <p className="text-sm text-muted-foreground">Use face recognition for quick attendance</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Your Name</label>
              <input
                ref={userNameRef}
                type="text"
                className="input-field w-full"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Period</label>
              <select
                className="input-field w-full"
                value={currentPeriod}
                onChange={(e) => setCurrentPeriod(e.target.value)}
              >
                <option value="">Select Period</option>
                {periods.map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                className="input-field w-full"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Camera Feed
                </h2>
                <div className="flex gap-2">
                  {!isStreamActive ? (
                    <button onClick={startCamera} className="btn-primary">
                      <Camera className="w-4 h-4 mr-2" />
                      Start Camera
                    </button>
                  ) : (
                    <button onClick={stopCamera} className="btn-secondary">
                      Stop Camera
                    </button>
                  )}
                </div>
              </div>

              <div className="relative bg-muted rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <div className="absolute inset-0 w-full h-full">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                
                {isScanning && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="bg-card rounded-lg p-6 text-center">
                      <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
                      <p className="font-medium">Detecting faces...</p>
                    </div>
                  </div>
                )}
                
                {!isStreamActive && (
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Camera Not Active</p>
                      <p className="text-sm">Click "Start Camera" to begin</p>
                    </div>
                  </div>
                )}
              </div>

              {isStreamActive && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={startScanning}
                    disabled={isScanning || !currentPeriod}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    <Scan className="w-4 h-4 mr-2" />
                    {isScanning ? 'Scanning...' : 'Start Scanning'}
                  </button>
                  
                  {detectedFaces.length > 0 && (
                    <button onClick={retryDetection} className="btn-secondary">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Detected Students ({detectedFaces.length})
              </h3>

              {detectedFaces.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Scan className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No faces detected</p>
                  <p className="text-sm">Start scanning to detect students</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {detectedFaces.map((face, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border transition-all ${
                        face.spoofed 
                          ? 'bg-danger/10 border-danger/30' 
                          : 'bg-success/10 border-success/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{face.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Roll Number: {face.rollNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Emotion: {face.emotion}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Spoofing Detected: {face.spoofed ? 'Yes' : 'No'}
                          </p>
                        </div>
                        {!face.spoofed && (
                          <CheckCircle className="w-5 h-5 text-success" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {detectedFaces.length > 0 && (
                <button
                  onClick={markAllAttendance}
                  className="btn-success w-full mt-4"
                  disabled={true}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Attendance Handled
                </button>
              )}
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold mb-3">Instructions</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>1. Select period and date</p>
                <p>2. Start the camera</p>
                <p>3. Click "Start Scanning" to detect faces</p>
                <p>4. The attendance is marked automatically upon detection</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CameraAttendance;