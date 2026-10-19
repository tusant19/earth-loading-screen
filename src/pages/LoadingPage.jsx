import react from 'react'
import { useState } from 'react'
import axios from 'axios'

function LoadingPage() {
    const [currentSlide, setCurrentSlide] = useState([])
    const [nextSlide, setNextSlide] = useState([])

    axios.get("https://en.wikipedia.org/w/api.php", {
        params: {
            action: "query",
            format: "json",
            list: "random",
            rnlimit: 1,
            origin: "*"
        }
    })
    .then((response) => {
        console.log(response.data)
        setCurrentSlide(response.data)
    })
    .catch((error) => {
        console.error("Error fetching data:", error)
    })

    return (
        <div className='loadingPageMain'>
            <div className='loadingPageSlide'>
                <p>Test</p>
            </div>
        </div>
    )
}
    
export default LoadingPage