'use client'

import { useCallback, useEffect, useRef, useState } from "react"
import Webcam from "react-webcam"
import { Fredoka } from "next/font/google"
import { Download } from "lucide-react"

const fredoka = Fredoka({ subsets: ['latin'] })

export default function Record() {
    const [timer, setTimer] = useState(0)
    const [isRecording, setIsRecording] = useState(false)
    const [recordedChunks, setRecordedChunks] = useState([])
    const [video, setVideo] = useState<HTMLElement>()

    const webcamRef = useRef<any>(null)
    const mediaRecorderRef = useRef<any>(null)

    const videoRef = useRef<any>(null)
    const canvasRef = useRef<any>(null)
    const ctx = canvasRef.current?.getContext("2d")

    useEffect(() => {
        if (timer > 0) {
            const intervalId = setInterval(() => {
                if (timer > 0) {
                    setTimer((prevTimer) => prevTimer - 1);
                }
            }, 1000)

            return () => clearInterval(intervalId)
        }
    }, [timer])

    const videoConstraints = {
        width: 640,
        height: 360
    }

    const handleStartCaptureClick = () => {
        setTimer(3)
        setIsRecording(true)

        mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
            mimeType: "video/webm"
        })
        mediaRecorderRef.current.addEventListener(
            "dataavailable",
            handleDataAvailable
        )

        setTimeout(() => {
            setRecordedChunks([])
            mediaRecorderRef.current.start()
        }, 3000)
    }

    const handleDataAvailable = ({ data }) => {
        if (data.size > 0) {
            setRecordedChunks((prev) => prev.concat(data))
        }
    }

    const handleStopCaptureClick = () => {
        mediaRecorderRef.current.stop()
        setIsRecording(false)
        setTimer(0)
    }

    useEffect(() => {
        if (recordedChunks.length) {
            const blob = new Blob(recordedChunks, {
                type: "video/webm"
            })
            const url = URL.createObjectURL(blob)
            const video = document.createElement("video")
            video.controls = true
            video.src = url

            while (videoRef.current.firstChild) {
                videoRef.current.removeChild(videoRef.current.firstChild)
            }
            setVideo(video)
            videoRef.current.appendChild(video)
        }
    }, [recordedChunks])

    useEffect(() => {
        video?.addEventListener(
            "play",
            () => {
                drawCanvas()
            },
            false,
        )
    }, [video, videoRef])

    function drawCanvas() {
        if (video?.paused || video?.ended) return
        ctx.drawImage(video, 0, 0, 300, 150)
        const frame = ctx.getImageData(0, 0, 300, 150, { willReadFrequently: true })
        const data = frame.data

        for (let i = 0; i < data.length; i += 4) {

            const red = data[i + 0]
            const green = data[i + 1]
            const blue = data[i + 2]

            if (
                red < green - 30 &&
                green > 75 &&
                blue < green
            ) {
                data[i + 3] = 0
            }
        }

        ctx.putImageData(frame, 0, 0)

        setTimeout(() => {
            drawCanvas()
        }, 0)
    }

    const handleDownload = useCallback(() => {
        if (recordedChunks.length) {
            const blob = new Blob(recordedChunks, {
                type: "video/webm"
            })
            const url = URL.createObjectURL(blob)
            const newVideo = document.createElement("video")
            newVideo.controls = true
            newVideo.src = url
            const a = document.createElement("a")
            document.body.appendChild(a)
            a.className = "hidden"
            a.href = url
            a.download = "gif-it.webm";
            a.click()
            window.URL.revokeObjectURL(url)
        }
    }, [recordedChunks])

    return (
        <>
            <div className="relative w-[30vw] mx-auto mt-20 border-4 border-gray-300 rounded-2xl overflow-hidden">
                <Webcam audio={false} mirrored={true} ref={webcamRef} videoConstraints={videoConstraints} className="rounded-xl" />
                {timer > 0 && <div
                    className={`absolute bottom-[50%] right-[50%] translate-x-1/2 translate-y-1/2 leading-none text-center text-[20vw] ${fredoka.className} text-red-600/60`}>
                    {timer}
                </div>}
                {isRecording && !timer && <div
                    className="absolute top-4 left-4 flex gap-2 items-center text-red-500 font-bold drop-shadow-sm animate-pulse">
                    <div className="rounded-full h-4 w-4 bg-red-500"></div>
                    REC
                </div>}
                {/* <button onClick={handleDownload} className="absolute right-4 top-4 border-2 rounded-full p-4"><Download /></button> */}
            </div>
            <button onClick={isRecording ? handleStopCaptureClick : handleStartCaptureClick}
                className={`flex mt-4 mx-auto w-16 h-16 bg-red-600 border-4 border-black ${isRecording ? '' : 'rounded-full'}`}>
            </button>
            <div className="flex bg-white p-4 gap-3">
                <div ref={videoRef} className="border-0 w-[30vw] rounded-xl ml-10 overflow-clip"></div>
                <canvas ref={canvasRef} className="border-0 w-[30vw] rounded-xl"></canvas>
            </div>
        </>
    )
}