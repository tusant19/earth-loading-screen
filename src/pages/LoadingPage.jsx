import react from 'react'
import { useState } from 'react'
import axios from 'axios'
import { useEffect } from 'react'
import { useRef } from 'react'
import { franc } from 'franc'
import './LoadingPage.css'
import unsafeWords from '../components/unsafeWords'
import logo from '../assets/logo.png'
import loadingBar from '../assets/Sprite-0006v3Cropped.png'
import loadingBarMobile from '../assets/Sprite-0006v3VerticalCropped.png'
import earthBg from '../assets/earthBgEvenMoreExpanded.png'
import earthBgMobile from '../assets/earthBgVerticalCroppedv2.png'
import thingsToBeLoading from '../components/thingToBeLoading.js'
import settingsIconDark from '../assets/settingsDark.svg'
import settingsIconLight from '../assets/settingLight.svg'

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
    const loadingBarRef = useRef(null)
    const loadingTextRef = useRef(null)
    const [currentLoading, setCurrentLoading] = useState("")
    const ignoreISSLimitRef = useRef(false)
    const ignoreNOAALimitRef = useRef(false)
    const bgRef = useRef(null)
    const loadingTextRefText = useRef(null)
    const settingsMenuRef = useRef(null)
    const githubLinkRef = useRef(null)
    const settingsIconRef = useRef(null)

    function bgSwithcer() {
        setLoadingTextOffset()
        if (window.innerWidth > 700) {
            return (
                <img src={earthBg} ref={bgRef} className="earthBg" alt="Earth Background" />
            )
        } else {
            return (
                <img src={earthBgMobile} ref={bgRef} className="earthBg" alt="Earth Background" />
            )
        }
    }

    function loadingBarSwitcher() {
        if (window.innerWidth > 700) {
            return (
                <img src={loadingBar} ref={loadingBarRef} className="loadingBar" alt="Loading Bar" />
            )
        } else {
            return (
                <img src={loadingBarMobile} ref={loadingBarRef} className="loadingBar" alt="Loading Bar" />
            )
        }
    }


    useEffect(() => {
        previousWidth.current = window.innerWidth;
        let timer = 0;
        const interval = setInterval(() => {
            timer += 25;
            if (window.innerWidth !== previousWidth.current) {
                previousWidth.current = window.innerWidth;
                handleResize();
            }
        }, 25);
        function handleResize() {
            if (timer >= 25) {
                timer = 0;
                console.log("resize");
                resetEverything();
                setLoadingTextOffset();
                
            }
        }
        return () => {
            clearInterval(interval);
        };
    }, [slides, currentSlide.current]);

    useEffect(() => {
        setLoadingTextOffset();
        setCurrentLoading(thingsToBeLoading[Math.floor(Math.random() * thingsToBeLoading.length)])
        const interval = setInterval(() => {
            let randomText = thingsToBeLoading[Math.floor(Math.random() * thingsToBeLoading.length)]
            setCurrentLoading(randomText);

        }, 20000);

        return () => clearInterval(interval)
    }, [])

    function setLoadingTextOffset() {
        if (loadingTextRef.current && loadingBarRef.current) {
            loadingTextRef.current.style.bottom = loadingBarRef.current.offsetHeight + "px";
            //console.log(loadingBarRef.current.offsetWidth);
            loadingTextRef.current.style.left = (window.innerWidth - loadingBarRef.current.offsetWidth) / 2 + (window.innerWidth / 100)+ "px";
            //console.log("loading text offset set: " + loadingTextRef.current.style.bottom + " left: " + loadingTextRef.current.style.left);
        }
    }

    function resetEverything() {
        //recalculate offset
        offset.current = 0;
        slides.forEach((slide, index) => {
            if (index < currentSlide.current) {
                offset.current -= window.innerWidth;
            }
        });
        slideTrackRef.current.style.transform = `translateX(${offset.current}px)`;
        //recalculate info widths
        slides.forEach((slide, index) => {
            if (window.innerWidth > 700) {
                if (imgRefs.current[index]) {
                    infoRefs.current[index].style.width = imgRefs.current[index].clientWidth + "px";
                }
            } else {
                if (infoRefs.current[index]) {
                    infoRefs.current[index].style.width = "100%";
                }
            }
        });
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
                        if (response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value.length > 20 && response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value.length < 200) {       
                            // check if image has been seen before
                            if (seenImagesVar.includes(response.data.query.pages[i].imageinfo[0].url) === false) {
                                // check img description language
                                if (franc(response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value) === "eng") {
                                    // check img description for unsafe words
                                    if (checkSlideContentSafety(response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value)) {
                                        if (ignoreISSLimitRef.current == false) {
                                            // if seen ISS hide further ISS images because there's a lot
                                            if (hasSeenISSRef.current == true && response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value.toLowerCase().includes("iss")) {
                                                continue;
                                            } else if (response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value.toLowerCase().includes("iss")) {
                                                hasSeenISSRef.current = true;
                                            }
                                        }
                                        if (ignoreNOAALimitRef.current == false) {
                                            // if seen NOAA hide further NOAA images because there's a lot
                                            if (hasSeenNOAARef.current == true && response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value.toLowerCase().includes("noaa")) {
                                                continue;
                                            } else if (response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value.toLowerCase().includes("noaa")) {
                                                hasSeenNOAARef.current = true;
                                            }
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
                    if (response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value.length > 20 && response.data.query.pages[i].imageinfo[0].extmetadata?.ImageDescription?.value.length < 200) {
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
                if (slide) {
                    slide.style.transition = `opacity ${fadeOutInTimeSeconds}s ease-in-out`
                    slide.style.opacity = 0;
                }
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
    }, [slides, currentSlide.current, readingTimes.current])

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

    //handle bg hiding when selected in menu
    function hideBg() {
        if (bgRef.current.style.display !== "none") {
            bgRef.current.style.display = "none";
            loadingTextRefText.current.style.color = "black";
            githubLinkRef.current.style.color = "black";
            // switch to dark settings icon
            settingsIconRef.current.src = settingsIconDark;
        } else {
            bgRef.current.style.display = "block";
            loadingTextRefText.current.style.color = "white";
            githubLinkRef.current.style.color = "white";
            // switch to light settings icon
            settingsIconRef.current.src = settingsIconLight;
        }
        
    }

    function toggleSettingsMenu() {
        console.log("toggle settings menu")
        if (settingsMenuRef.current.style.opacity != "1") {
            settingsMenuRef.current.style.opacity = "1";
            settingsMenuRef.current.style.pointerEvents = "auto";
        } else {
            settingsMenuRef.current.style.opacity = "0";
            settingsMenuRef.current.style.pointerEvents = "none";
        }
    }

    //prevent clicks of settings options when not visible
    useEffect(() => {
        if (settingsMenuRef.current) {
            if (settingsMenuRef.current.style.opacity != "1") {
                settingsMenuRef.current.style.pointerEvents = "none";
            }
        }
    }, [])


    function handleClickOutside(event) {
        if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target) && event.target !== settingsMenuRef.current && event.target !== settingsIconRef.current) {
            settingsMenuRef.current.style.opacity = "0";
        }
    }

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        quickFetchFirstSlide();
        artistRefs.current[0]?.setHTML("Artist: " + slides[0]?.artist)
        descRefs.current[0]?.setHTML(slides[0]?.desc)
    }, [slideRefs.current[0], descRefs.current[0], artistRefs.current[0]])

    return (
        <div className='loadingPageMain'>
            <div className="githubLinkDiv">
                <a href="https://github.com/tusant19/earth-loading-screen" target="_blank" rel="noopener noreferrer" ref={githubLinkRef}>github</a>
            </div>
            <div className="settingsIconDiv">
                <img src={settingsIconLight} ref={settingsIconRef} className="settingsIcon" alt="Settings" onClick={toggleSettingsMenu} />
            </div>
            <div className="settingsMenuDiv" ref={settingsMenuRef}>
                <p className="settingsMenuText">Settings</p>
                <div className="wpmSliderDiv">
                    <input type="range" min="60" max="300" value={wpm} className="wpmSlider" onChange={(e) => setWpm(e.target.value)} />
                    <p className="wpmSliderText">Words per minute: {wpm}</p>
                </div>
                <div className='fadeOutSliderDiv'>
                    <input type="range" min="0" max="5" step="0.1" value={fadeOutInTimeSeconds} className="fadeOutSlider" onChange={(e) => setFadeOutInTimeSeconds(e.target.value)} />
                    <p className="fadeOutSliderText">Fade out/in time: {fadeOutInTimeSeconds}s</p>
                </div>
                <p className="ignoreSlideTypeLimitText">By default only one image that has ISS or NOAA in the description is shown. You can change that here.</p>
                <div className="ignoreSlideTypeLimitCheckboxDiv">
                    
                    <input type="checkbox" id="ignoreISSLimit" onChange={(e) => ignoreISSLimitRef.current = e.target.checked} />
                    <label htmlFor="ignoreISSLimit">Ignore ISS image limit</label>
                    <input type="checkbox" id="ignoreNOAALimit" onChange={(e) => ignoreNOAALimitRef.current = e.target.checked} />
                    <label htmlFor="ignoreNOAALimit">Ignore NOAA image limit</label>
                    
                </div>
                <div className="dontShowBackgroundCheckboxDiv">
                    <input type="checkbox" id="dontDisplayBackground" onChange={(e) => hideBg()} />
                    <label htmlFor="dontDisplayBackground">Don't display background</label>
                </div>
            </div>
            <div className="earthBgDiv">
                {bgSwithcer()}
            </div>
            <div className="loadingBarTopTextDiv" ref={loadingTextRef}>
                <p className="loadingBarLoadingText silkscreen-regular" ref={loadingTextRefText}>Loading: {currentLoading}...</p>
            </div>
            <div className="loadingBarDiv">
                {loadingBarSwitcher()}
            </div>
            <div className='startOverlay' ref={overlayRef} onClick={hideOverlay}>
                <img src={logo} onClick={hideOverlay} className="startOverlayLogo" alt="Logo" />
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