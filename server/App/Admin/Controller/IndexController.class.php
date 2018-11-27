<?php
namespace Admin\Controller;
use Think\Controller;

class IndexController extends PublicController{
	//***********************************
	// iframe式显示菜单和index页
	//**********************************
	public function index(){
	    $menu="";
	    $index="";

      if (intval($_SESSION['admininfo']['qx']) == 4) {
        $menu="<include File='Page/adminusermenu'/>";
      } else {
        $menu="<include File='Page/usermenu'/>";
      }

      $index="<iframe src='".U('Page/adminindex')."' id='iframe' name='iframe'></iframe>";

       //版权
       $copy=M('web')->where('id=5')->getField('concent');
       $this->assign('copy',$copy);
       $this->assign('menu',$menu);
       $this->assign('index',$index);
	   $this->display();
	}
}