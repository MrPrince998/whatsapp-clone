import React from 'react'
import { View, ViewProps } from 'react-native'

interface SeparatorProps extends ViewProps {
  /** Orientation of the separator */
  orientation?: 'horizontal' | 'vertical'
  /** Custom className for styling with NativeWind */
  className?: string
}

const Separator = ({
  orientation = 'horizontal',
  className = '',
  ...props
}: SeparatorProps) => {
  const defaultClasses = orientation === 'horizontal'
    ? 'h-[1px] w-full bg-gray-200'
    : 'w-[1px] h-full bg-gray-200'

  return (
    <View
      className={`${defaultClasses} ${className}`}
      {...props}
    />
  )
}

export default Separator
