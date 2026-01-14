const express = require('express');
const router = express.Router();
const controller = require('../controllers/member.controller');

router.get('/', controller.getMembers);
router.get('/:id', controller.getMemberById);
router.post('/', controller.createMember);
router.put('/:id', controller.updateMember);
router.delete('/:id', controller.deleteMember);

module.exports = router;