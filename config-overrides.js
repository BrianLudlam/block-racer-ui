const { override, fixBabelImports, addLessLoader } = require('customize-cra');

module.exports = override(
	fixBabelImports('import', {
		libraryName: 'antd',
		libraryDirectory: 'es',
		style: true
	}),
	addLessLoader({
		javascriptEnabled: true,
		modifyVars: { 
			'@body-background': "#f0f2f5",
			'@component-background': "#f0f2f5",
			'@layout-body-background': "#f0f2f5",
			'@layout-header-background': "#002950",
			'@primary-color': "#ffc107", // primary color for all components
			'@border-color-base': "#002950",
			'@border-color-split': "#002950",
			'@link-color': "#005bb2", // link color
			'@heading-color': "#002950",// heading text color
			'@text-color': "#002950",// major text color
			'@text-color-secondary': "#005bb2",// secondary text color
            //'@border-color': "@green-6", // major border color
            //'@normal-color': "@purple-5",
			//'@success-color': "#52c41a", // success state color
			//'@warning-color': "#faad14", // warning state color
			//'@error-color': "#f5222d", // error state color
			//'@font-size-base': "14px", // major text font size
			//'@disabled-color': "rgba(0, 0, 0, .50)", // disable state color
			//'@border-radius-base': "4px",// major border radius
			//'@border-shadow-base': "0 2px 8px rgba(0, 0, 0, 0.15)",// major shadow for layers
		},
	}),
);

/* Default Theme 
@primary-color: #1890ff; // primary color for all components
@link-color: #1890ff; // link color
@success-color: #52c41a; // success state color
@warning-color: #faad14; // warning state color
@error-color: #f5222d; // error state color
@font-size-base: 14px; // major text font size
@heading-color: rgba(0, 0, 0, 0.85); // heading text color
@text-color: rgba(0, 0, 0, 0.65); // major text color
@text-color-secondary : rgba(0, 0, 0, .45); // secondary text color
@disabled-color : rgba(0, 0, 0, .25); // disable state color
@border-radius-base: 4px; // major border radius
@border-color-base: #d9d9d9; // major border color
@box-shadow-base: 0 2px 8px rgba(0, 0, 0, 0.15); // major shadow for layers
*/