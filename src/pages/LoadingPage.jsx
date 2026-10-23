import react from 'react'
import { useState } from 'react'
import axios from 'axios'
import { useEffect } from 'react'
import { useRef } from 'react'
import { franc } from 'franc'
import './LoadingPage.css'
import unsafeWords from '../components/unsafeWords'
import logo from '../assets/logo.png'
import loadingBar from '../assets/loadingBar2.png'
import earthBg from '../assets/earthBg2.png'

function LoadingPage() {
    const hasSeenISSRef = useRef(false)
    const hasSeenNOAARef = useRef(false)
    const [delayBetweenSlides, setDelayBetweenSlides] = useState(5000);
    const [fadeOutInTimeSeconds, setFadeOutInTimeSeconds] = useState(2);
    const [apiRequestsInLastMinute, setApiRequestsInLastMinute] = useState(0);
    const previousWidth = useRef(0);
    const [wpm, setWpm] = useState(120);
    const [slides, setSlides] = useState([])
    const [seenImages, setSeenImages] = useState([])
    const infoRefs = useRef([])
    const imgRefs = useRef([])
    const readingTimes = useRef([])
    const currentSlide = useRef(0)
    const slideRefs = useRef([])
    const descRefs = useRef([])
    const artistRefs = useRef([])
    const offset = useRef(0)
    const slideTrackRef = useRef(null)
    const overlayRef = useRef(null)
    const trackContainerRef = useRef(null)

    useEffect(() => {
        previousWidth.current = window.innerWidth;
        let timer = 0;
        const interval = setInterval(() => {
            timer += 200;
            if (window.innerWidth !== previousWidth.current) {
                previousWidth.current = window.innerWidth;
                handleResize();
            }
        }, 200);
        function handleResize() {
            if (timer >= 200) {
                timer = 0;
                console.log("resize");
                resetEverything();
                
            }
        }
        return () => {
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
    })

    function resetEverything() {
        setSlides([])
        setSeenImages([])
        hasSeenISSRef.current = false
        hasSeenNOAARef.current = false
        setApiRequestsInLastMinute(0)
        infoRefs.current = []
        imgRefs.current = []
        readingTimes.current = []
        currentSlide.current = 0
        slideRefs.current = []
        descRefs.current = []
        artistRefs.current = []
        offset.current = 0
        slideTrackRef.current.style.transform = `translateX(${offset.current}px)`
        quickFetchFirstSlide(true)
        slideRefs.map((slide, index) => {
            slide.style.transition = `opacity ${fadeOutInTimeSeconds}s ease-in-out`
            slide.style.opacity = 1;
        })
    }

    function fetchSlides(override) {
        if (apiRequestsInLastMinute >= 60) {
            //console.log"API guardrail reached")
            return
        }
        setApiRequestsInLastMinute(apiRequestsInLastMinute + 1)
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
            let slidesVar;
            let seenImagesVar;
            if (override) {
                setSlides([])
                setSeenImages([])
                slidesVar = []
                seenImagesVar = []
            } else {
                slidesVar = slides;
                seenImagesVar = seenImages;
            }
            
            for (let i = 0; i < response.data.query.pages.length; i++) {
                //console.log"checked image: ")
                // check img type
                if (response.data.query.pages[i].imageinfo[0].mime === "image/jpeg" || response.data.query.pages[i].imageinfo[0].mime === "image/png" || response.data.query.pages[i].imageinfo[0].mime === "image/gif" || response.data.query.pages[i].imageinfo[0].mime === "image/webp" || response.data.query.pages[i].imageinfo[0].mime === "image/svg+xml") {
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
                                        if (hasSeenISSRef.current == true && response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value.toLowerCase().includes("iss")) {
                                            continue;
                                        } else if (response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value.toLowerCase().includes("iss")) {
                                            hasSeenISSRef.current = true;
                                        }
                                        // if seen NOAA hide further NOAA images because there's a lot
                                        if (hasSeenNOAARef.current == true && response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value.toLowerCase().includes("noaa")) {
                                            continue;
                                        } else if (response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value.toLowerCase().includes("noaa")) {
                                            hasSeenNOAARef.current = true;
                                        }
                                        let spaceCount = (response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value.match(/ /g) || []).length;
                                        let readingTime = (spaceCount + 1) / wpm * 60 * 1000 + (fadeOutInTimeSeconds * 1000 * 2);
                                        readingTimes.current.push(readingTime)
                                        //console.log"reading time: " + readingTime);
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
                                        
                                        
                                        //console.logresponse.data.query.pages[i].imageinfo[0].extmetadata)
                                        seenImagesVar.push(response.data.query.pages[i].imageinfo[0].url)
                                        slidesFoundCount++
                                        //console.log"image found")
                                    }
                                }
                            }
                        }
                    }
                } else {
                    //console.log"declide Image type: " + response.data.query.pages[i].imageinfo[0].mime)
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
        //console.log"word found: " + unsafeWords.some((word) => desc.toLowerCase().includes(word)))
        return !unsafeWords.some((word) => desc.toLowerCase().includes(word))
    }

    function quickFetchFirstSlide() {
        if (apiRequestsInLastMinute >= 60) {
            //console.log"API guardrail reached")
            return
        }
        setApiRequestsInLastMinute(apiRequestsInLastMinute + 1)
        //console.log"quick fetch start " + Date.now())
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
                iiurlwidth: 1080,
                _: Date.now()
            }
        })
        .then((response) => {
            if (response.status == 429) {
                //console.log"Rate limit reached, adding warning slide")
                addWarningSlide()
                return
            }
            //console.log"quick fetch finish " + Date.now())
            let slidesVar = slides;
            let foundSlide = false;
            let seenImagesVar = seenImages;
            for (let i = 0; i < response.data.query.pages.length; i++) {
                // check img type
                if (response.data.query.pages[i].imageinfo[0].mime === "image/jpeg" || response.data.query.pages[i].imageinfo[0].mime === "image/png" || response.data.query.pages[i].imageinfo[0].mime === "image/gif" || response.data.query.pages[i].imageinfo[0].mime === "image/webp" || response.data.query.pages[i].imageinfo[0].mime === "image/svg+xml") {
                    // check img description length
                    if (response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value.length > 40 && response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value.length < 300) {
                        // check if image has been seen before
                        if (seenImagesVar.includes(response.data.query.pages[i].imageinfo[0].url) === false) {
                            // check image desctiption for unsafe words
                            if (checkSlideContentSafety(response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value)) {
                                // check img description for html (not in use)
                                if (/* (/<[^>]+>/.test(response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value)) */ true) {
                                    let spaceCount = (response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value.match(/ /g) || []).length;
                                    let readingTime = (spaceCount + 1) / wpm * 60 * 1000 + (fadeOutInTimeSeconds * 1000 * 2);
                                    readingTimes.current.push(readingTime)
                                    //console.log"reading time: " + readingTime);
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
                                    //console.log"quick fetch found slide " + response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value)
                                    foundSlide = true
                                    seenImagesVar.push(response.data.query.pages[i].imageinfo[0].url)
                                    break
                                }
                            }
                        }
                    }
                }
            }
            if (foundSlide === false) {
                //console.log"No valid slide")
                quickFetchFirstSlide()
            } else {
                setSlides([...slidesVar])
                setSeenImages([...seenImagesVar])
            }
            if (slidesVar.length < 4) {
                fetchSlides()
            }
        })
        .catch((error) => {
            console.error("Error fetching data:", error)
        })
    }

    function addWarningSlide() {
        let slidesVar = slides;
        for (let i = 0; i < 4; i++) {
            slidesVar.push(
                {
                    imgLink: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Commons-logo.svg/1200px-Commons-logo.svg.png",
                    desc: "Rate limit reached. Please wait a minute before continuing.",
                    license: "Public Domain",
                    artist: "Wikimedia Commons",
                    licenseUrl: "https://commons.wikimedia.org/wiki/File:Commons-logo.svg",
                    sourceLink: "https://commons.wikimedia.org/wiki/File:Commons-logo.svg"
                }
            )
            setSlides([...slidesVar])
        }
    }

    //pretty self explanatory for the most part
    function nextSlide() {
        // if ratelimited
        if (slides.lenth <= currentSlide.current + 2) {
            //console.log"Rate limit reached, adding warning slide")
            //insert ratelimit warning slide
            addWarningSlide()
        }

        if (currentSlide.current == 0) {
            for (let slide of slideRefs.current) {
                slide.style.transition = `opacity ${fadeOutInTimeSeconds}s ease-in-out`
                slide.style.opacity = 0;
            }
        }
        // fade out the currently displayed slide
        slideRefs.current[currentSlide.current].style.transition =  `opacity ${fadeOutInTimeSeconds}s ease-in-out`
        slideRefs.current[currentSlide.current].style.opacity = 0;
        //wait before continuing
        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        wait(fadeOutInTimeSeconds * 1000).then(() => {
            //if not mobile
            if (window.innerWidth > 700) {
                infoRefs.current[currentSlide.current + 1].style.width = imgRefs.current[currentSlide.current + 1].clientWidth + "px";
            }
            //console.log"info width: " + infoRefs.current[currentSlide.current + 1].style.width);
            //console.log"img width: " + imgRefs.current[currentSlide.current + 1].clientWidth);
            slideRefs.current[currentSlide.current + 2].style.opacity = 0;
            //console.log"desc to be set: " + slides[currentSlide.current + 1].desc)
            descRefs.current[currentSlide.current + 1].setHTML(slides[currentSlide.current + 1].desc)
            artistRefs.current[currentSlide.current + 1].setHTML("Artist: " + slides[currentSlide.current + 1].artist)
            //console.log"current slide desc " + slides[currentSlide.current + 1].desc)
            slideRefs.current[currentSlide.current + 1].style.transition = `opacity ${fadeOutInTimeSeconds}s ease-in-out`
            slideRefs.current[currentSlide.current + 1].style.opacity = 1
            if (currentSlide.current < slides.length - 4) {
                //console.log"enough slides left")
                currentSlide.current += 1
                offset.current -= window.innerWidth
                slideTrackRef.current.style.transform = `translateX(${offset.current}px)`
                
            } else {
                currentSlide.current += 1
                offset.current -= window.innerWidth
                slideTrackRef.current.style.transform = `translateX(${offset.current}px)`
                //console.log"get more")
                fetchSlides()
            }
        })

        
    }

    useEffect(() => {
            fetchSlides()
    }, [])

    // scroll on a timer
    useEffect(() => {
        let timer = 0;
        const interval = setInterval(() => {
            timer += 300;
            if (timer >= readingTimes.current[currentSlide.current]) {
                //console.log"current slide desc: " + slides[currentSlide.current].desc);
                timer = 0;
                //console.log"Interval triggered")
                // fetchSlides()
                nextSlide()
            }
            
        }, 300);
        
        return () =>  {
            clearInterval(interval)
        }
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setApiRequestsInLastMinute(0)
        }, 60000)
        return () => clearInterval(interval)
    }, [])
    
    function hideOverlay() {
        if (overlayRef.current) {
            overlayRef.current.style.opacity = 0;       
            overlayRef.current.style.pointerEvents = "none";
        }
    }

    useEffect(() => {
        quickFetchFirstSlide();
        artistRefs.current[0]?.setHTML("Artist: " + slides[0]?.artist)
        descRefs.current[0]?.setHTML(slides[0]?.desc)
    }, [slideRefs.current[0], descRefs.current[0], artistRefs.current[0]])

    return (
        <div className='loadingPageMain'>
            <div className="earthBgDiv">
                <img src={earthBg} className="earthBg" alt="Earth Background" />
            </div>
            <img src={loadingBar} className="loadingBar" alt="Loading Bar" />
            <div className='startOverlay' ref={overlayRef} onClick={hideOverlay}>
                <img src={logo} className="startOverlayLogo" alt="Logo" />
            </div>
            <div className='trackContainer' ref={trackContainerRef}>
                <div className='loadingPageTrack' ref={slideTrackRef}>
                    {slides.map((slide, index) => (
                        <div key={index} className='slide' ref={el => slideRefs.current[index] = el}>
                            <div className='slideInner'>
                                <div className='slideImgDiv'>
                                    <img src={slide.imgLink} ref={el => imgRefs.current[index] = el} className="slideImg" alt="Current Slide Img" />
                                </div>
                                <div ref={el => infoRefs.current[index] = el} className='slideDetailsDiv'>
                                    <div className='slideDescDiv'>
                                        <p className='slideDesc' ref={el => descRefs.current[index] = el}></p>
                                    </div>
                                    <details className='slideDetails'>
                                        <summary>Details</summary>
                                        <div className='slideInfoDiv'>
                                            <p className='slideInfo' ref={el => artistRefs.current[index] = el}>Artist: {slide.artist}</p>
                                            <p className='slideInfo'>License: <a href={slide.licenseUrl} target="_blank" rel="noopener noreferrer">{slide.license}</a></p>
                                            <p className='slideInfo'>Source: <a href={slide.sourceLink} target="_blank" rel="noopener noreferrer">Wikimedia Commons</a></p>
                                            <p className='croppingDisclaimer'>Images may be cropped to fit the screen</p>
                                        </div>
                                    </details>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default LoadingPage