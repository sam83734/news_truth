import { Request, Response } from 'express';
import { dltService, VALIDATOR_NODES } from '../services/dltService';
import { db } from '../data/db';
import { ArticleModel } from '../models/Article';
import mongoose from 'mongoose';

export const getLedger = (_req: Request, res: Response) => {
  try {
    const ledgerData = dltService.getLedger();
    res.json({
      success: true,
      data: ledgerData,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching DLT ledger', error });
  }
};

export const getBlockByEntityId = (req: Request, res: Response) => {
  try {
    const { entityId } = req.params;
    const block = dltService.getBlockByEntityId(entityId);

    if (!block) {
      return res.status(404).json({
        success: false,
        message: `No DLT Block found anchored for entity ID ${entityId}`,
      });
    }

    res.json({
      success: true,
      data: block,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching block', error });
  }
};

export const verifyArticleIntegrity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find article from DB or memory
    let article: any = null;
    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      article = await ArticleModel.findOne(isObjectId ? { _id: id } : { customId: id });
    }

    if (!article) {
      article = db.articles.find((a) => a.id === id);
    }

    if (!article) {
      return res.status(404).json({
        success: false,
        message: `Article with ID ${id} not found in database to verify.`,
      });
    }

    const verification = dltService.verifyArticleIntegrity(article.toJSON ? article.toJSON() : article);

    res.json({
      success: true,
      data: verification,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error verifying article integrity', error });
  }
};

export const anchorArticleToLedger = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    let article: any = null;
    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      article = await ArticleModel.findOne(isObjectId ? { _id: id } : { customId: id });
    }

    if (!article) {
      article = db.articles.find((a) => a.id === id);
    }

    if (!article) {
      return res.status(404).json({
        success: false,
        message: `Article with ID ${id} not found to anchor.`,
      });
    }

    const block = dltService.anchorArticle(article.toJSON ? article.toJSON() : article);

    res.json({
      success: true,
      message: `Article ${id} successfully sealed and anchored on SusaLabs DLT Truth Ledger.`,
      data: block,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error anchoring article to DLT', error });
  }
};

export const verifyBlockProof = (req: Request, res: Response) => {
  try {
    const index = parseInt(req.params.index, 10);
    if (isNaN(index)) {
      return res.status(400).json({ success: false, message: 'Invalid block index provided' });
    }

    const verification = dltService.verifyBlockProof(index);
    if (!verification) {
      return res.status(404).json({ success: false, message: `Block #${index} not found in ledger` });
    }

    res.json({
      success: true,
      data: verification,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error verifying block proof', error });
  }
};

export const verifyChainIntegrity = (_req: Request, res: Response) => {
  try {
    const auditReport = dltService.verifyFullChain();
    res.json({
      success: true,
      data: auditReport,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error verifying full chain integrity', error });
  }
};

export const simulateTamperAttack = (req: Request, res: Response) => {
  try {
    const { targetIndexOrId, tamperedTitle, tamperedContent } = req.body;
    if (!tamperedTitle && !tamperedContent) {
      return res.status(400).json({
        success: false,
        message: 'Must provide tamperedTitle or tamperedContent to simulate hacker attack.',
      });
    }

    const result = dltService.simulateTamperAttack(
      targetIndexOrId ?? 0,
      tamperedTitle || 'Tampered Title',
      tamperedContent || 'Tampered Content'
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error running tamper simulation', error });
  }
};

export const getIpfsDocument = (req: Request, res: Response) => {
  try {
    const { cid } = req.params;
    const doc = dltService.getIpfsDocument(cid);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: `IPFS Document with CID ${cid} not found on decentralized gateway node.`,
      });
    }

    res.json({
      success: true,
      data: doc,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching IPFS document', error });
  }
};

export const getValidatorNodes = (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        totalNodes: VALIDATOR_NODES.length,
        bftQuorumThreshold: '2/3 Nodes (66.7%)',
        nodes: VALIDATOR_NODES.map((n) => ({
          nodeId: n.nodeId,
          nodeName: n.nodeName,
          role: n.role,
          publicKey: n.publicKey,
          endpoint: n.endpoint,
          status: n.status,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching validator nodes', error });
  }
};
