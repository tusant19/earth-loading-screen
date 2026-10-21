import react from 'react'
import { useState } from 'react'
import axios from 'axios'
import { useEffect } from 'react'
import { useRef } from 'react'
import { franc } from 'franc'
import './LoadingPage.css'
import unsafeWords from '../components/unsafeWords'

function LoadingPage() {
    const [hasSeenISS, setHasSeenISS] = useState(false)
    const [hasSeenNOAA, setHasSeenNOAA] = useState(false)
    const [delayBetweenSlides, setDelayBetweenSlides] = useState(5000);
    const [fadeOutInTimeSeconds, setFadeOutInTimeSeconds] = useState(2);
    const [slides, setSlides] = useState([])
    const [seenImages, setSeenImages] = useState([])
    const currentSlide = useRef(0)
    const slideRefs = useRef([])
    const descRefs = useRef([])
    const artistRefs = useRef([])
    const offset = useRef(0)
    const slideTrackRef = useRef(null)
    const overlayRef = useRef(null)
    const trackContainerRef = useRef(null)

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
                                        // check img description for unsafe words
                                        if (checkSlideContentSafety(response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value)) {
                                            // if seen ISS hide further ISS images because there's a lot
                                            if (hasSeenISS === true && response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value.toLowerCase().includes("iss")) {
                                                continue;
                                            } else if (response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value.toLowerCase().includes("iss")) {
                                                setHasSeenISS(true)
                                            }
                                            // if seen NOAA hide further NOAA images because there's a lot
                                            if (hasSeenNOAA === true && response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value.toLowerCase().includes("noaa")) {
                                                continue;
                                            } else if (response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value.toLowerCase().includes("noaa")) {
                                                setHasSeenNOAA(true)
                                            }
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

    function checkSlideContentSafety (desc) {
        console.log("word found: " + unsafeWords.some((word) => desc.toLowerCase().includes(word)))
        return !unsafeWords.some((word) => desc.toLowerCase().includes(word))
    }

    function quickFetchFirstSlide() {
        console.log("quick fetch start " + Date.now())
        axios.get("https://commons.wikimedia.org/w/api.php", {
            params: {
                action: "query",
                format: "json",
                prop: "imageinfo",
                generator: "random",
                iiprop: "url|extmetadata|mime|size|",
                grnnamespace: 6,
                grnlimit: 5,
                formatversion: 2,
                origin: "*",
                iiextmetadatalanguage: "en",
                _: Date.now()
            }
        })
        .then((response) => {
            console.log("quick fetch finish " + Date.now())
            let slidesVar = slides;
            let foundSlide = false;
            let seenImagesVar = seenImages;
            for (let i = 0; i < response.data.query.pages.length; i++) {
                // check img type
                if (response.data.query.pages[i].imageinfo[0].mime === "image/jpeg" || response.data.query.pages[i].imageinfo[0].mime === "image/png" || response.data.query.pages[i].imageinfo[0].mime === "image/gif" || response.data.query.pages[i].imageinfo[0].mime === "image/webp" || response.data.query.pages[i].imageinfo[0].mime === "image/svg+xml") {
                    // check img size
                    if (response.data.query.pages[i].imageinfo[0].size < 10000000) {
                        // check img description length
                        if (response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value.length > 40 && response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value.length < 300) {
                            // check if image has been seen before
                            if (seenImagesVar.includes(response.data.query.pages[i].imageinfo[0].url) === false) {
                                // check image desctiption for unsafe words
                                if (checkSlideContentSafety(response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value)) {
                                    // check img description for html (not in use)
                                    if (/* (/<[^>]+>/.test(response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value)) */ true) {
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
                                        artistRefs.current[0]?.setHTML("Artist: " + slidesVar[0]?.artist)
                                        descRefs.current[0]?.setHTML(slidesVar[0]?.desc)
                                        console.log("quick fetch found slide " + response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value)
                                        foundSlide = true
                                        seenImagesVar.push(response.data.query.pages[i].imageinfo[0].url)
                                        break
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (foundSlide === false) {
                console.log("No valid slide")
                quickFetchFirstSlide()
            } else {
                setSlides([...slidesVar])
                setSeenImages([...seenImagesVar])
            }
        })
        .catch((error) => {
            console.error("Error fetching data:", error)
        })
    }

    //pretty self explanatory for the most part
    function nextSlide() {
        // fade out the currently displayed slide
        slideRefs.current[currentSlide.current].style.transition =  `opacity ${fadeOutInTimeSeconds}s ease-in-out`
        slideRefs.current[currentSlide.current].style.opacity = 0;
        //wait before continuing
        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        wait(fadeOutInTimeSeconds * 1000).then(() => {
            slideRefs.current[currentSlide.current + 2].style.opacity = 0;
            console.log("desc to be set: " + slides[currentSlide.current + 1].desc)
            descRefs.current[currentSlide.current + 1].setHTML(slides[currentSlide.current + 1].desc)
            artistRefs.current[currentSlide.current + 1].setHTML("Artist: " + slides[currentSlide.current + 1].artist)
            console.log("current slide desc " + slides[currentSlide.current + 1].desc)
            slideRefs.current[currentSlide.current + 1].style.transition = `opacity ${fadeOutInTimeSeconds}s ease-in-out`
            slideRefs.current[currentSlide.current + 1].style.opacity = 1
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
        })

        
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
        }, delayBetweenSlides);
        
        return () =>  {
            clearInterval(interval)
        }
    }, [])
    
    function hideOverlay() {
        if (overlayRef.current) {
            overlayRef.current.style.opacity = 0;       
        }
    }

    useEffect(() => {
        quickFetchFirstSlide();
        artistRefs.current[0]?.setHTML("Artist: " + slides[0]?.artist)
        descRefs.current[0]?.setHTML(slides[0]?.desc)
    }, [slideRefs.current[0], descRefs.current[0], artistRefs.current[0]])

    return (
        <div className='loadingPageMain'>
            <div className='startOverlay' ref={overlayRef} onClick={hideOverlay}>
                <p>Universe incorporated</p>
                <p>Press anywhere to start</p>
            </div>
            <div className='trackContainer' ref={trackContainerRef}>
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