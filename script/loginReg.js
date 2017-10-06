export default{
	
	login:function(){
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
			return false;
		})
		
		
		//注册验证
		$('#register-register').on('click',function(){
			var phon = /^1[34578]\d{9}$/;
			if($('#usn').val().toString().trim()===''){
				$('#usnJudge').html('请输入用户名');
				return false;
			}else{
				$('#usnJudge').html('');
			}
			if($('#pwd1').val().toString().trim()===''){
				$('#pwd1Judge').html('请输入密码');
				return false;
			}else{
				$('#pwd1Judge').html('');
			}
			if($('#pwd2').val().toString().trim()===''){
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
			alert('chenggong ')
			return false;
		})
		
		
		//发送验证码
		var num = 30;
		var timer;
		$('#sendCode').on('click',function(){
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
	
	
	
}