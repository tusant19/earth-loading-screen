import react from 'react'
import { useState } from 'react'
import axios from 'axios'
import { useEffect } from 'react'
import { useRef } from 'react'
import { franc } from 'franc'
import './LoadingPage.css'

function LoadingPage() {
    const [slides, setSlides] = useState([])
    const [seenImages, setSeenImages] = useState([])
    const currentSlide = useRef(0)
    const slideRefs = useRef([])
    const descRefs = useRef([])
    const artistRefs = useRef([])
    const offset = useRef(0)
    const slideTrackRef = useRef(null)
    const overlayRef = useRef(null)

    function fetchSlides() {
        let slidesFoundCount = 0;
        axios.get("https://commons.wikimedia.org/w/api.php", {
            params: {
                action: "query",
                format: "json",
                prop: "imageinfo",
                generator: "random",
                iiprop: "url|extmetadata|mime|size|extracts",
                grnnamespace: 6,
                grnlimit: 20,
                formatversion: 2,
                origin: "*",
                iiextmetadatalanguage: "en",
                _: Date.now()
            }
        })
        .then((response) => {
            let slidesVar = slides;
            let seenImagesVar = seenImages;
            for (let i = 0; i < response.data.query.pages.length; i++) {
                console.log("checked image: ")
                // check img type
                if (response.data.query.pages[i].imageinfo[0].mime === "image/jpeg" || response.data.query.pages[i].imageinfo[0].mime === "image/png" || response.data.query.pages[i].imageinfo[0].mime === "image/gif" || response.data.query.pages[i].imageinfo[0].mime === "image/webp" || response.data.query.pages[i].imageinfo[0].mime === "image/svg+xml") {
                    // check img size
                    if (response.data.query.pages[i].imageinfo[0].size < 5000000) {
                        // check img description for html (not in use)
                        if ( /*(/<[^>]+>/.test(response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value)) == false */ true) {
                            // check img description length
                            if (response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value.length > 40 && response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value.length < 300) {       
                                // check if image has been seen before
                                if (seenImagesVar.includes(response.data.query.pages[i].imageinfo[0].url) === false) {
                                    // check img description language
                                    if (franc(response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value) === "eng") {
                                        // add slide to slides array
                                        slidesVar.push(
                                            {
                                                imgLink: response.data.query.pages[i].imageinfo[0].url,
                                                desc: response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value,
                                                license: response.data.query.pages[i].imageinfo[0].extmetadata?.LicenseShortName?.value,
                                                artist: response.data.query.pages[i].imageinfo[0].extmetadata?.Artist?.value,
                                                licenseUrl: response.data.query.pages[i].imageinfo[0].extmetadata?.LicenseUrl?.value,
                                                sourceLink: response.data.query.pages[i].imageinfo[0]?.descriptionurl
                                            }
                                        )
                                        
                                        
                                        console.log(response.data.query.pages[i].imageinfo[0].extmetadata)
                                        seenImagesVar.push(response.data.query.pages[i].imageinfo[0].url)
                                        slidesFoundCount++
                                        console.log("image found")
                                    }
                                }
                            }
                        }
                    }
                } else {
                    console.log("declide Image type: " + response.data.query.pages[i].imageinfo[0].mime)
                }
            }
            if (slidesFoundCount === 0) {
                fetchSlides()
            }
            setSlides([...slidesVar])
            setSeenImages([...seenImagesVar])
        })
        .catch((error) => {
            console.error("Error fetching data:", error)
        })
    }
    
    // pretty self explanatory
    function nextSlide() {
        descRefs.current[currentSlide.current + 1].setHTML(slides[currentSlide.current + 1].desc)
        artistRefs.current[currentSlide.current + 1].setHTML("Artist: " + slides[currentSlide.current + 1].artist)

        slideTrackRef.current.style.transition = 'transform 2.5s ease-in-out'
        if (currentSlide.current < slides.length - 4) {
            console.log("enough slides left")
            currentSlide.current += 1
            offset.current -= window.innerWidth
            slideTrackRef.current.style.transform = `translateX(${offset.current}px)`
            
        } else {
            currentSlide.current += 1
            offset.current -= window.innerWidth
            slideTrackRef.current.style.transform = `translateX(${offset.current}px)`
            console.log("get more")
            fetchSlides()
        }
    }

    useEffect(() => {
            fetchSlides()
    }, [])

    // scroll on a timer
    useEffect(() => {
        const interval = setInterval(() => {
            
            console.log("Interval triggered")
            
            // fetchSlides()
            nextSlide()
        }, 5000);
        
        return () =>  {
            clearInterval(interval)
        }
    }, [])

    useEffect(() => {
        if (artistRefs.current[0] == null || descRefs.current[0] == null) {
            return
        }

        artistRefs.current[0].setHTML("Artist: " + slides[0]?.artist)
        descRefs.current[0].setHTML(slides[0]?.desc)
    }, [slides])
    
    function hideOverlay() {
        if (overlayRef.current) {
            overlayRef.current.style.display = 'none';
        }
    }

    return (
        <div className='loadingPageMain'>
            <div className='startOverlay' ref={overlayRef} onClick={hideOverlay}>
                <p>Universe incorporated</p>
                <p>Press anywhere to start</p>
            </div>
            <div className='trackContainer'>
                <div className='loadingPageTrack' ref={slideTrackRef}>
                    {slides.map((slide, index) => (
                        <div key={index} className='slide' ref={el => slideRefs.current[index] = el}>
                            <div className='slideImgDiv'>
                                <img src={slide.imgLink} loading="lazy" className="slideImg" alt="Current Slide Img" />
                            </div>
                            <div className='slideDescDiv'>
                                <p className='slideDesc' ref={el => descRefs.current[index] = el}></p>
                            </div>
                            <div className='slideInfoDiv'>
                                <p className='slideInfo' ref={el => artistRefs.current[index] = el}>Artist: {slide.artist}</p>
                                <p className='slideInfo'>License: <a href={slide.licenseUrl} target="_blank" rel="noopener noreferrer">{slide.license}</a></p>
                                <p className='slideInfo'>Source: <a href={slide.sourceLink} target="_blank" rel="noopener noreferrer">Wikimedia Commons</a></p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default LoadingPage