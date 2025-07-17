"use client"

import { motion } from "framer-motion"
import { useColorModeValue } from '@chakra-ui/react'

function LoadingThreeDotsJumping() {
    const dotColor = useColorModeValue('#000000', '#ffffff')
    
    const dotVariants = {
        jump: {
            y: -30,
            transition: {
                duration: 0.8,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
            },
        },
    }

    return (
        <motion.div
            animate="jump"
            transition={{ staggerChildren: -0.2, staggerDirection: -1 }}
            className="container"
        >
            <motion.div className="dot" variants={dotVariants} style={{ backgroundColor: dotColor }} />
            <motion.div className="dot" variants={dotVariants} style={{ backgroundColor: dotColor }} />
            <motion.div className="dot" variants={dotVariants} style={{ backgroundColor: dotColor }} />
            <StyleSheet />
        </motion.div>
    )
}

/**
 * ==============   Styles   ================
 */
function StyleSheet() {
    return (
        <style>
            {`
            .container {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 4px;
            }

            .dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                will-change: transform;
            }
            `}
        </style>
    )
}

export default LoadingThreeDotsJumping 