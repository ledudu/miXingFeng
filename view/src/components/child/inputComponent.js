import React, { forwardRef } from "react"

const InputComponent = forwardRef((props, ref) => {
	const {
		type = "text",
		placeholder = "",
		value = "",
		handleKeyDown = () => {},
		handleChange = () => {},
		maxLength = 26,
		style = {},
		handleClick = () => {},
		handleBlur = () => {},
		className
	} = props
	return (
		<input
			className={`input-component ${className}`}
			type={type}
			placeholder={placeholder}
			value={value}
			onKeyDown={handleKeyDown}
			onChange={handleChange}
			maxLength={maxLength}
			autoComplete="off"
			style={style}
			onClick={handleClick}
			onBlur={handleBlur}
			ref={ref}
		/>
	)
})

export default InputComponent
