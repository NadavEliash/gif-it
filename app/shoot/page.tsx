'use client'
import { Download } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import Webcam from "react-webcam"


export default function Shoot() {
    const [isRecording, setIsRecording] = useState(false)
    const [recordedChunks, setRecordedChunks] = useState([])

    const webcamRef = useRef<any>(null)
    const mediaRecorderRef = useRef<any>(null)

    const videoConstraints = {
        aspectRatio: 1,
        width: {min:1920},
        height: {min:1080}
    }

    const handleStartCaptureClick = useCallback(() => {
        setIsRecording(true)
        setRecordedChunks([])

        mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
            mimeType: "video/webm"
        });
        mediaRecorderRef.current.addEventListener(
            "dataavailable",
            handleDataAvailable
        );
        mediaRecorderRef.current.start()
    }, [webcamRef, setIsRecording, mediaRecorderRef])

    const handleDataAvailable = useCallback(
        ({ data }) => {
            if (data.size > 0) {
                setRecordedChunks((prev) => prev.concat(data))
            }
        },
        [setRecordedChunks]
    )

    const handleStopCaptureClick = useCallback(() => {
        mediaRecorderRef.current.stop()
        setIsRecording(false)
    }, [mediaRecorderRef, webcamRef, setIsRecording])

    const handleDownload = useCallback(() => {
        if (recordedChunks.length) {
            const blob = new Blob(recordedChunks, {
                type: "video/webm"
            })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            document.body.appendChild(a)
            a.className = "hidden"
            a.href = url
            a.download = "gif-it.webm";
            a.click()
            window.URL.revokeObjectURL(url)
            setRecordedChunks([])
        }
    }, [recordedChunks]);


    return (
        <>
            <div className="relative w-3/4 max-w-[80vh] mx-auto mt-20 border-4 border-gray-300 rounded-2xl">
                <Webcam audio={false} mirrored={true} ref={webcamRef} videoConstraints={videoConstraints} className="mx-auto"/>
                {isRecording && <div className="absolute rounded-full h-5 w-5 bg-red-600 top-4 left-4 animate-pulse"></div>}
                <button onClick={isRecording ? handleStopCaptureClick : handleStartCaptureClick}
                    className={`absolute bottom-4 left-[50%] -translate-x-[50%] w-16 h-16 bg-red-600 border-4 border-black ${isRecording ? '' : 'rounded-full'}`}>
                </button>
                {recordedChunks.length > 0 && (
                    <button onClick={handleDownload} className="absolute right-4 top-4 bg-slate-600 rounded-full p-4"><Download/></button>
                )}
            </div>
        </>
    )
}