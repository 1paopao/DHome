export default{	
	login:function(){
		if(localStorage.getItem('num')){
			var n = localStorage.getItem('num');
			switch (n){
					case '0': {
							$('#loginTitlt').addClass('login-active').siblings().removeClass('login-active');
							$('#login').css('display','block');
							$('#register').css('display','none');
							$('#log .change').attr('src','view/loginReg.html');
					};
						break;
					case '1': {
						$('#loginTitlt1').addClass('login-active').siblings().removeClass('login-active');		
						$('#login').css('display','none');
						$('#register').css('display','block');
					}
						break;
				}
		}
		//登录样式显现与影藏
		$('#login-tunp a').on('click',function(){
			var i = $(this).index();
			$(this).addClass('login-active').siblings().removeClass('login-active');
			switch (i){
				case 0: {
					$('#login').css('display','block');
					$('#register').css('display','none');
					
				};
					break;
				case 1: {
					$('#login').css('display','none');
					$('#register').css('display','block');
				}
					break;
			}
		})
		
		//登录验证
		$('#login-login').on('click',function(){
			if($('#username').val().toString().trim()===''){
				$('#username-judge').html('请输入用户名');
				return false;
			}else{
				$('#username-judge').html('');
			}
			if($('#password').val().toString().trim()==''){
				$('#password-judge').html('请输入密码');
				return false;
			}else{
				$('#password-judge').html('');
			}
			$.ajax({
				type:"get",
				data:{'user_phone':$('#username').val().toString(),'user_password':$('#password').val().toString()},
				url:"http://www.drehome.com/dreamhome/user",
				async:true,
				success:function(data) {
					console.log(data);
					switch (data.code){
						case 0:alert('用户名或者密码错误！！！！')
							break;
						case 1:
							location.href = 'fatie.html';
							sessionStorage.setItem('username',$('#username').val().toString());
							break;
					}
				}
			
			});
			
			return false;
		})
		
		
		//注册验证
		$('#register-register').on('click',function(){
			var phon = /^1[34578]\d{9}$/;
			var use = /^[a-zA-Z0-9_-]{3,6}$/;
			var pas = /^[a-zA-Z0-9_-]{6,16}$/;
			if(use.test($('#usn').val().toString().trim())===false){
				$('#usnJudge').html('请输入用户名，用户名为3-6位');
				return false;
			}else{
				$('#usnJudge').html('');
			}
			
			
			if(pas.test($('#pwd1').val().toString().trim())==false){
				$('#pwd1Judge').html('请输入密码,密码为6-16位');
				return false;
			}else{
				$('#pwd1Judge').html('');
			}
			if(pas.test($('#pwd2').val().toString().trim())==false){
				$('#pwd2Judge').html('请输入密码');
				return false;
			}else{
				$('#pwd2Judge').html('');
			}
			
			if($('#pwd1').val() !==$('#pwd2').val()){
				$('#pwd2Judge').html('您输入的两次密码不一致');
				return false;
			}
			if($('#phone').val().toString().trim()===''){
				$('#phoneJudge').html('请输入手机号');
				return false;
			}else{
				$('#phoneJudge').html('');
			}
			
			
			if(phon.test($('#phone').val().toString().trim())==false){
				$('#phoneJudge').html('请输入正确的手机号');
				return false;
			}else{
				$('#phoneJudge').html('');
			}
			
			
			if($('#verificationCode').val().toString().trim()===''){
				alert('请输入验证码')
				$('#verificationCode').html('');
				return false;
			}
			if($('#checkbox').prop('checked')!==true){
				alert('你还未同意用户协议');
				return false;
			}
			console.log($('#usn').val().toString(),$('#pwd1').val().toString(),$('#pwd2').val().toString(),$('#phone').val().toString(),$('#verificationCode').val().toString());
			$.ajax({
				type:"get",
				url:"http://www.drehome.com/dreamhome/adduser",
				data:{'user_name':$('#usn').val().toString(),'user_password':$('#pwd1').val().toString(),'repassword':$('#pwd2').val().toString(),'user_phone':$('#phone').val().toString(),'yanzhen':$('#verificationCode').val().toString()},
				success:function(data) {
					console.log(data);
					/*switch (data.code){
						case 10:alert('你输入的手机号不一致');
							break;
						case 20:alert('你输入的验证码不一致');
							break;
						case 30:$('#pwd2Judge').html('您输入的两次密码不一致');
							break;
						case 40:alert('数据输入不合法')
							break;
						case 50:alert('注册失败，数据已经存在')
							break;
						case 1:alert('注册成功')
							break;
					}*/
				}
			
			});
			return false;
		})
		
		
		
		
	},
	
	loginyanzheng:function(){
		//发送验证码
		var num = 30;
		var timer;
		$('#sendCode').on('click',function(){
			$.ajax({
				type:"get",
				data:{'user_phone':$('#phone').val().toString()},
				url:"http://www.drehome.com/dreamhome/phone",
				success:function(data) {
					console.log(data);
				}
			});
			clearInterval(timer);
		    timer = setInterval(function(){
				$('#sendCode').html(num+'s');
				if(num<0){
					clearInterval(timer);
					$('#sendCode').html('重新发送验证码');
					num = 30;
				}
				num--;
			},1000);
			
			
		})
		
	}
	
	
};