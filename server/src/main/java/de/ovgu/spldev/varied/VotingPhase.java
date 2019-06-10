package de.ovgu.spldev.varied;

import org.pmw.tinylog.Logger;

import java.util.*;

public class VotingPhase {
    static class VotingStrategy {
        interface IVoters {
            void onJoin(Collaborator collaborator);
            void onLeave(Collaborator collaborator);
            boolean isEligible(Collaborator collaborator);
            Collection<Collaborator> getVoters();

            class Noone implements IVoters {
                public void onJoin(Collaborator collaborator) {
                }

                public void onLeave(Collaborator collaborator) {
                }

                public boolean isEligible(Collaborator collaborator) {
                    return false;
                }

                public Collection<Collaborator> getVoters() {
                    return new HashSet<>();
                }
            }

            class Everyone implements IVoters {
                Set<Collaborator> voters;

                Everyone(Collection<Collaborator> collaborators) {
                    voters = new HashSet<>(collaborators);
                }

                public void onJoin(Collaborator collaborator) {
                    voters.add(collaborator);
                }

                public void onLeave(Collaborator collaborator) {
                    voters.remove(collaborator);
                }

                public boolean isEligible(Collaborator collaborator) {
                    return voters.contains(collaborator);
                }

                public Collection<Collaborator> getVoters() {
                    return voters;
                }
            }
        }

        interface IResolutionCriterion {
            boolean isResolved(IVoters voters, Map<Collaborator, String> voteResults);

            class Immediately implements IResolutionCriterion {
                public boolean isResolved(IVoters voters, Map<Collaborator, String> voteResults) {
                    return true;
                }
            }

            class OnFirstVote implements IResolutionCriterion {
                public boolean isResolved(IVoters voters, Map<Collaborator, String> voteResults) {
                    return voteResults.entrySet().size() > 0;
                }
            }
        }

        interface IResolutionOutcome {
            String getElectedVersionID(Map<Collaborator, String> voteResults);

            class Neutral implements IResolutionOutcome {
                public String getElectedVersionID(Map<Collaborator, String> voteResults) {
                    return "neutral";
                }
            }

            class Any implements IResolutionOutcome {
                public String getElectedVersionID(Map<Collaborator, String> voteResults) {
                    return voteResults.entrySet().iterator().next().getValue();
                }
            }
        }

        IVoters voters;
        IResolutionCriterion resolutionCriterion;
        IResolutionOutcome resolutionOutcome;

        public VotingStrategy(IVoters voters, IResolutionCriterion resolutionCriterion, IResolutionOutcome resolutionOutcome) {
            this.voters = voters;
            this.resolutionCriterion = resolutionCriterion;
            this.resolutionOutcome = resolutionOutcome;
        }

        static VotingStrategy neutralWinsImmediately() {
            return new VotingStrategy(
                    new IVoters.Noone(),
                    new IResolutionCriterion.Immediately(),
                    new IResolutionOutcome.Neutral());
        }

        static VotingStrategy firstVoteWins(Collection<Collaborator> collaborators) {
            return new VotingStrategy(
                    new IVoters.Everyone(collaborators),
                    new IResolutionCriterion.OnFirstVote(),
                    new IResolutionOutcome.Any());
        }
    }

    private VotingStrategy votingStrategy;
    private Map<Collaborator, String> voteResults;

    public VotingPhase(VotingStrategy votingStrategy) {
        Logger.info("initializing voting phase");
        this.votingStrategy = votingStrategy;
        voteResults = new HashMap<>();
    }

    public Collection<Collaborator> getVoters() {
        return votingStrategy.voters.getVoters();
    }

    public void vote(Collaborator collaborator, String versionID) {
        Logger.info("{} voted for version {}", collaborator, versionID);
        if (versionID == null)
            voteResults.remove(collaborator);
        else
            voteResults.put(collaborator, versionID);
    }

    public String getElectedVersionID() {
        if (!votingStrategy.resolutionCriterion.isResolved(votingStrategy.voters, voteResults))
            return null;

        Logger.info("resolution criterion triggered, concluding voting phase");
        String electedVersionID = votingStrategy.resolutionOutcome.getElectedVersionID(voteResults);
        Logger.info("final elected version is {}", electedVersionID);
        return electedVersionID;
    }

    public boolean isEligible(Collaborator collaborator) {
        return votingStrategy.voters.isEligible(collaborator);
    }

    public void onJoin(Collaborator collaborator) {
        votingStrategy.voters.onJoin(collaborator);
    }

    public void onLeave(Collaborator collaborator) {
        votingStrategy.voters.onLeave(collaborator);
    }
}
