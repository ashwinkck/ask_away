import React from 'react'
import Spline from '@splinetool/react-spline'

const SplineAnimation = ({ blur = false }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        filter: blur ? 'blur(3px)' : 'none',
        transition: 'filter 0.5s ease'
      }}
    >
      <Spline scene="https://prod.spline.design/gZqsFW3sgA6YgpMv/scene.splinecode" />
    </div>
  )
}

export default SplineAnimation 