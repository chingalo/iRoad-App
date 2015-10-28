var appControllers = angular.module('appControllers', ['appServices']);

//definition of functions
appControllers.controller('LoginController',LoginController);
appControllers.controller('HomeController', HomeController);
appControllers.controller('DriverVerificationController', DriverVerificationController);
appControllers.controller('VehicleVerificationController', VehicleVerificationController);

appControllers.controller('ReportAccidentsController', ReportAccidentsController);
appControllers.controller('ReportOffenceHomeController', ReportOffenceHomeController);
appControllers.controller('ReportOffenceController', ReportOffenceController);
appControllers.controller('PaymentsController',PaymentsController);
appControllers.controller('DriverLicenceVerificationController',DriverLicenceVerificationController);
appControllers.controller('PaymentVerification',PaymentVerification);

//functions implementations


/*
*for control of all login logic for form submission to redirect to home page for success login user
 */
function LoginController($scope,$location,$rootScope){
	//variables for the app
	$rootScope.configuration = {
		'user': {},
		'loginPage': false,
		'useData': {},
		'config': {},
		'url' : 'http://localhost:8080/demo'
		//'url':'http://roadsafety.go.tz/demo'
	};

	$rootScope.pageChanger = {
		'reportOffense': {},
		'reportAccident': {},
		'payments': {},
		'verifyDriver' : {},
		'verifyVehicle' : {}
	};
	$scope.loginUser = {};
	$scope.loginFormAvailability = true;
	$scope.loginPage = false;

	//function to set setting for app for debug process
	$scope.setSetting = function () {
		$scope.loginFormAvailability = !$scope.loginFormAvailability;
	}
	//function to close set up for setting
	$scope.closeSetSetting = function () {
		$scope.loginFormAvailability = !$scope.loginFormAvailability;
	}

	//setting configurations
	$scope.setConfigurations = function () {
		$rootScope.configuration.url = $rootScope.configuration.url;
		$scope.closeSetSetting();
	}

	$scope.login = function(){
		//checking for username and password has been entered
		if ($scope.loginUser.username && $scope.loginUser.password) {
			$rootScope.configuration.user = $scope.loginUser;
			var base = $rootScope.configuration.url;
			if(base){
				Ext.Ajax.request({
					url : base + '/dhis-web-commons-security/login.action?failed=false',
					callbackKey : 'callback',
					method : 'POST',
					params : {
						j_username : $scope.loginUser.username,
						j_password : $scope.loginUser.password
					},
					withCredentials : true,
					useDefaultXhrHeader : false,
					success: function (data) {
						console.log('Data : ' + JSON.stringify('success, ready for checking user'));
						//call checking if user is available
						Ext.Ajax.request({
							url: base + '/api/me.json',
							callbackKey : 'callback',
							method : 'GET',
							params : {
								j_username : $scope.loginUser.username,
								j_password : $scope.loginUser.password
							},
							withCredentials : true,
							useDefaultXhrHeader : false,
							success : function(response){
								try{
									$rootScope.configuration.user = $scope.loginUser;
									var loginUserData = JSON.parse(response.responseText);
									$scope.loginUser = {};

									//loading library
									var dhisConfigs = {
										baseUrl: $rootScope.configuration.url + '/',
										refferencePrefix: "Program_"
									};

									$rootScope.configuration.config = dhisConfigs;
									dhisConfigs.onLoad = function () {
										console.log('success loading library');
									}
									iroad2.Init(dhisConfigs);
									$rootScope.configuration.useData = loginUserData;
									$rootScope.configuration.loginPage = true;
									$rootScope.pageChanger.successLogin = {'home' : true};
									$rootScope.$apply();
								}
								catch (e){
									$scope.message = "wrong password or username";
									$rootScope.configuration.loginPage = false;
									$rootScope.$apply();
								}
							}
						});

					},
					failure : function(response) {
						//fail to connect to the server
						console.log('Data : ' + JSON.stringify(response))
						$scope.message  = "Checking you network services";
					}
				});
			}
			else{
				$scope.loginFormAvailability = !$scope.loginFormAvailability;
			}

		}
		//empty submitted form		
		else{

			$location.path('/');
			$scope.message  = "Please enter password or username";

		};
	}

}


/*
*for control all navigation actions to render a given page
 */
function HomeController($scope,$rootScope){

	//control report offence link on navigation
	$scope.reportOffence = function(){

		$rootScope.pageChanger = {};
		$rootScope.pageChanger.reportOffense = {'home': true};
		console.log(JSON.stringify($rootScope.pageChanger));

	}

	//control driver verification view form
	$scope.verifyDriver = function(){
		$rootScope.pageChanger = {};
		$rootScope.pageChanger.verifyDriver = {'home': true};
		console.log(JSON.stringify($rootScope.pageChanger));
	}

	//control vehicle verification view form
	$scope.verifyVehicle = function(){
		$rootScope.pageChanger = {};
		$rootScope.pageChanger.verifyVehicle = {'home': true};
		console.log(JSON.stringify($rootScope.pageChanger));
	}

	//control links for reporting accident form
	$scope.reportAccidents = function(){

		$rootScope.pageChanger = {};
		$rootScope.pageChanger.reportAccidents = {'home': true};
		console.log(JSON.stringify($rootScope.pageChanger));
	}

	//to loguot form the system
	$scope.logOut = function(){
		var base = $rootScope.configuration.url;
		Ext.Ajax.request({
			url: base + '/dhis-web-commons-security/logout.action',
			callbackKey: 'callback',
			method: 'GET',
			params: {
				j_username: $rootScope.configuration.user.username,
				j_password: $rootScope.configuration.user.password
			},
			withCredentials: true,
			useDefaultXhrHeader: false,
			success: function () {
				$scope.message = "Success log out ";
				$scope.$apply();
				$rootScope.configuration.loginPage = false;
				$rootScope.$apply()
			}
		});
	}
}


/*
*for control all function for verification of driver
 */
function DriverVerificationController($scope,$rootScope,DriverServices){

	var driverModal =  new iroad2.data.Modal('Driver',[]);
	$scope.data = {'driverData' : false}


	//funcion to verify driver based on given plate number
	$scope.verifyDriver = function(){
		if($scope.data.driverLicenceNumber){

			//fetching driver from system
			driverModal.get({value:$scope.data.driverLicenceNumber},function(result){
				$scope.data.Driver = result;
				console.log(JSON.stringify(result))
				if(result.length > 0){
					$scope.data.driverData = true;
				}
				else{
					$scope.data.driverData = false;
				}

				$scope.$apply();
			});

		}
		else{
			console.log('empty');
		}
	}
}


/*
*Controller for verification of vehicles
*
 */
function VehicleVerificationController($scope){

	$scope.data = {};

	//function to verify vehicle based on given vehicle plate number
	$scope.verifyVehicle = function () {

		if($scope.data.vehilcePlateNumber){
			console.log('ready to search plate number');
		}
		else{
			console.log('no plate number');
		}
	}


}


function ReportAccidentsController($scope,$rootScope){


}


function ReportOffenceHomeController($scope,$location,$rootScope){


}


function ReportOffenceController($scope,$rootScope){


}


//controller for payments
function PaymentsController($scope,$location,$rootScope){


}


function DriverLicenceVerificationController ($scope,$location) {




}


function PaymentVerification($scope){


}

