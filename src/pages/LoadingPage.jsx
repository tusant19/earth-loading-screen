import react from 'react'
import { useState } from 'react'
import axios from 'axios'
import { useEffect } from 'react'
import { useRef } from 'react'
import { franc } from 'franc'
import './LoadingPage.css'

function LoadingPage() {
    const [slides, setSlides] = useState([])
    const currentSlide = useRef(0)
    const slideRefs = useRef([])
    const offset = useRef(0)
    const slideTrackRef = useRef(null)

    function fetchSlides() {
        axios.get("https://commons.wikimedia.org/w/api.php", {
            params: {
                action: "query",
                format: "json",
                prop: "imageinfo",
                generator: "random",
                iiprop: "url|extmetadata|mime|size|extracts",
                grnnamespace: 6,
                grnlimit: 25,
                formatversion: 2,
                origin: "*",
                iiextmetadatalanguage: "en",
                _: Date.now()
            }
        })
        .then((response) => {
            let slidesVar = slides
            for (let i = 0; i < response.data.query.pages.length; i++) {
                if (response.data.query.pages[i].imageinfo[0].mime === "image/jpeg" || response.data.query.pages[i].imageinfo[0].mime === "image/png" || response.data.query.pages[i].imageinfo[0].mime === "image/gif" ) {
                    if (response.data.query.pages[i].imageinfo[0].size < 3000000) {
                        if ( (/<[^>]+>/.test(response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value)) == false ) {
                            if (response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value.length > 40 && response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value.length < 150) {
                                if (franc(response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value) === "eng") {
                                    slidesVar.push(
                                        {
                                            imgLink: response.data.query.pages[i].imageinfo[0].url,
                                            desc: response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value,
                                            license: response.data.query.pages[i].imageinfo[0].extmetadata?.LicenseShortName?.value,
                                            attribution: response.data.query.pages[i].imageinfo[0].extmetadata?.Attribution?.value
                                        }
                                    )
                                }
                                
                            }
                        }
                    }
                }
            }
            setSlides([...slidesVar])
        })
        .catch((error) => {
            console.error("Error fetching data:", error)
        })
    }

    function nextSlide() {
        if (currentSlide.current < slides.length - 3) {
            currentSlide.current += 1
            offset.current -= slideRefs.current[currentSlide.current].offsetWidth
            slideTrackRef.current.style.transform = `translateX(${offset.current}px)`
        }
        if (currentSlide.current >= slides.length - 2) {
            fetchSlides()
        }
    }

    useEffect(() => {
            fetchSlides()
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            
            console.log("Interval triggered")
            
            fetchSlides()
        }, 4000);
        
        return () =>  {
            clearInterval(interval)
        }
    }, [])
    

    return (
        <div className='loadingPageMain'>
            <div className='loadingPageTrack' ref={slideTrackRef}>
                {slides.map((slide, index) => (
                    <div key={index} className='slide' ref={el => slideRefs.current[index] = el}>
                        <div className='slideImgDiv'>
                            <img src={slide.imgLink} loading="lazy" className="slideImg" alt="Current Slide Img" />
                        </div>
                        <div className='slideDescDiv'>
                            <p className='slideDesc'>{slide.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default LoadingPage