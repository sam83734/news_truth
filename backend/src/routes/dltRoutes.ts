import { Router } from 'express';
import {
  getLedger,
  getBlockByEntityId,
  verifyArticleIntegrity,
  anchorArticleToLedger,
  verifyBlockProof,
  verifyChainIntegrity,
  simulateTamperAttack,
  getIpfsDocument,
  getValidatorNodes,
} from '../controllers/dltController';

const router = Router();

router.get('/ledger', getLedger);
router.get('/blocks/:entityId', getBlockByEntityId);
router.get('/verify/:id', verifyArticleIntegrity);
router.post('/anchor/:id', anchorArticleToLedger);
router.get('/verify-block/:index', verifyBlockProof);
router.get('/verify-chain', verifyChainIntegrity);
router.post('/simulate-tamper', simulateTamperAttack);
router.get('/ipfs/:cid', getIpfsDocument);
router.get('/validators', getValidatorNodes);

export default router;
