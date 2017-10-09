/*main.css*/
import $ from 'n-zepto';
import './scss/complist.scss';
import './scss/compdetail.scss';
import './scss/rijidetail.scss';
/*公司列表*/
import Complist from './script/complist.js';
Complist.init();
/*公司详情*/
import Compdetail from './script/compdetail.js';
Compdetail.init();
Compdetail.detail();
import './scss/home.scss';
import './scss/loginReg.scss';
import './scss/termsOfService.scss';
import './scss/decorationRaiders.scss';
import './scss/riji.scss';

import './scss/fatie.scss';
import LoginReg from './script/loginReg.js';
LoginReg.login();
LoginReg.loginyanzheng();

if(sessionStorage.getItem('username')){
	$('#log .change').html('<em>&#xe6cb;</em>'+'欢迎'+sessionStorage.getItem('username'));
	$('#log .change').attr('href','view/fatie.html');
	$('#log .change1').html('<em>&#xe6cb;</em>'+'欢迎'+sessionStorage.getItem('username'));
	$('#log .change1').attr('href','fatie.html');
}else{
	$('#log .change').attr('href','view/loginReg.html');
	$('#log .change1').attr('href','loginReg.html');
}

$('#log a').on('click',function(){
	var i = $(this).index();
	console.log(i)
	localStorage.setItem('num',i);
})
