import BlurVignette from "@/components/ui/blur-vignette"
import React from "react"


function Check() {
  return (
    <div className="flex items-center justify-center  w-full flex items-center justify-center">
      <div className="relative max-w-7xl w-full px-4 sm:px-8">
        <BlurVignette
          radius="24px"
          inset="10px"
          transitionLength="100px"
          blur="15px"
          className="rounded-[2.5rem] w-full h-[400px] sm:h-[500px] flex items-center justify-center shadow-xl"
          switchView={true}
        >
          <img
            src="/footer2.svg"
            alt="Footer Illustration"
            className="w-full h-full object-cover transition-all rounded-[2.5rem]"
          />
        </BlurVignette>
      </div>
    </div>
  )
}

export default Check
