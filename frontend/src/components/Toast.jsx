import {useEffect } from 'react'

export default function Toast({ msg, type,onDone}){
    useEffect(() => {
        const t= setTimeout(onDone, 300)
        return ()=> clearTimeout(t)

    }, [onDone])
}