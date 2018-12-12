<?php
namespace Admin\Controller;
use Think\Controller;
class MessageController extends PublicController{

	/*
	*
	* 构造函数，用于导入外部文件和公共方法
	*/
	public function _initialize(){
		$this->message = M('message');
	}

	/*
	*
	* 查询小喇叭数据
	*/
	public function index(){
    $message_list = $this->message->select();
		$this->assign('message_list',$message_list);
		$this->display();
	}

	/*
	*
	* 跳转添加或修改小喇叭数据页面
	*/
	public function add(){
		if (intval($_GET['id'])) {
			$id = intval($_GET['id']);

			$message_info = $this->message->where('id='.intval($id))->find();

			if (!$message_info) {
				$this->error('没有找到相关信息.');
				exit();
			}

      $message_info['id'] = $id;
			$this->assign('message_info',$message_info);
		}

		$this->display();
	}


  public function save(){
		$this->message->create();

		//保存数据
		if (intval($_POST['id'])) {
			$result = $this->message->where('id='.intval($_POST['id']))->save();
		}else{
			//保存添加时间
			$result = $this->message->add();
		}

		//判断数据是否更新成功
		if ($result) {
      if (intval($_POST['id'])) {
			  $this->success('操作成功.', 'index');
      } else {
        $this->success('操作成功.');
      }
		}else{
			$this->error('操作失败.');
		}
	}

	/*
	*
	* 删除小喇叭
	*/
	public function del(){
		//获取小喇叭id，查询数据库是否有这条数据
		$id = intval($_GET['id']);
		$check_info = $this->message->where('id='.intval($id))->find();
		if (!$check_info) {
			$this->error('系统繁忙，请时候再试！');
			exit();
		}

		//删除
		$up = $this->message->where('id='.intval($id))->delete();

		if ($up) {
			$this->success('操作成功.','index');
		}else{
			$this->error('操作失败.');
		}
	}
}