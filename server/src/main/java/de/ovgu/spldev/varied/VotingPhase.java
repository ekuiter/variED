package de.ovgu.spldev.varied;

import org.pmw.tinylog.Logger;

import java.util.*;
import java.util.stream.Collectors;

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

            class OnlyInvolved implements IVoters {
                Set<Collaborator> involvedCollaborators, voters;

                OnlyInvolved(Collection<Collaborator> involvedCollaborators) {
                    this.involvedCollaborators = new HashSet<>(involvedCollaborators);
                    voters = new HashSet<>(involvedCollaborators);
                }

                public void onJoin(Collaborator collaborator) {
                    if (involvedCollaborators.contains(collaborator))
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

            default boolean isRejected(IVoters voters, Map<Collaborator, String> voteResults) {
                return voters.getVoters().size() == 0;
            }

            class Immediately implements IResolutionCriterion {
                public boolean isResolved(IVoters voters, Map<Collaborator, String> voteResults) {
                    return true;
                }

                public boolean isRejected(IVoters voters, Map<Collaborator, String> voteResults) {
                    return false;
                }
            }

            class OnFirstVote implements IResolutionCriterion {
                public boolean isResolved(IVoters voters, Map<Collaborator, String> voteResults) {
                    return voteResults.entrySet().size() > 0;
                }
            }

            class OnLastVote implements IResolutionCriterion {
                public boolean isResolved(IVoters voters, Map<Collaborator, String> voteResults) {
                    return voteResults.entrySet().size() == voters.getVoters().size();
                }
            }

            class OnLastVoteOrDissent implements IResolutionCriterion {
                public boolean isResolved(IVoters voters, Map<Collaborator, String> voteResults) {
                    return voteResults.entrySet().size() == voters.getVoters().size() ||
                            voteResults.values().stream().distinct().count() > 1;
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
                    return voteResults.entrySet().size() > 0
                            ? voteResults.values().iterator().next()
                            : null;
                }
            }

            // version with most votes wins
            class Plurality implements IResolutionOutcome {
                static List<Map.Entry<String, Long>> getVersionIDsWithPlurality(Map<Collaborator, String> voteResults) {
                    Map<String, Long> voteDistribution = voteResults.values().stream()
                            .collect(Collectors.groupingBy(versionID -> versionID, Collectors.counting()));
                    long maxNumberOfVotes = voteDistribution.values().stream().max(Comparator.comparing(Long::valueOf)).get();

                    return voteDistribution.entrySet().stream()
                            .filter(entry -> entry.getValue() == maxNumberOfVotes)
                            .collect(Collectors.toList());
                }

                public String getElectedVersionID(Map<Collaborator, String> voteResults) {
                    if (voteResults.entrySet().size() == 0)
                        return null;
                    List<Map.Entry<String, Long>> versionIDsWithMajority = getVersionIDsWithPlurality(voteResults);
                    if (versionIDsWithMajority.size() > 1)
                        return null; // voting tie
                    return versionIDsWithMajority.iterator().next().getKey();
                }
            }

            // version with most votes wins if it has more than half of all votes
            class Majority implements IResolutionOutcome {
                public String getElectedVersionID(Map<Collaborator, String> voteResults) {
                    if (voteResults.entrySet().size() == 0)
                        return null;
                    List<Map.Entry<String, Long>> versionIDsWithMajority = Plurality.getVersionIDsWithPlurality(voteResults);
                    if (versionIDsWithMajority.size() > 1)
                        return null; // voting tie
                    Map.Entry<String, Long> versionIDWithMajority = versionIDsWithMajority.iterator().next();
                    return versionIDWithMajority.getValue() > voteResults.size() - versionIDWithMajority.getValue()
                            ? versionIDWithMajority.getKey()
                            : null; // not a majority
                }
            }

            class Consensus implements IResolutionOutcome {
                public String getElectedVersionID(Map<Collaborator, String> voteResults) {
                    if (voteResults.entrySet().size() == 0)
                        return null;
                    if (voteResults.values().stream().distinct().count() > 1)
                        return null; // dissent
                    return voteResults.values().iterator().next();
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

        static VotingStrategy reject() {
            return new VotingStrategy(
                    new IVoters.Noone(),
                    new IResolutionCriterion.Immediately(),
                    new IResolutionOutcome.Neutral());
        }

        static VotingStrategy firstVote(IVoters voters) {
            return new VotingStrategy(
                    voters,
                    new IResolutionCriterion.OnFirstVote(),
                    new IResolutionOutcome.Any());
        }

        static VotingStrategy plurality(IVoters voters) {
            return new VotingStrategy(
                    voters,
                    new IResolutionCriterion.OnLastVote(),
                    new IResolutionOutcome.Plurality());
        }

        static VotingStrategy majority(IVoters voters) {
            return new VotingStrategy(
                    voters,
                    new IResolutionCriterion.OnLastVote(),
                    new IResolutionOutcome.Majority());
        }

        static VotingStrategy consensus(IVoters voters) {
            return new VotingStrategy(
                    voters,
                    new IResolutionCriterion.OnLastVoteOrDissent(),
                    new IResolutionOutcome.Consensus());
        }

        static VotingStrategy createInstance(
                String votingStrategy, boolean onlyInvolved,
                Collection<Collaborator> collaborators, Collection<Collaborator> involvedCollaborators) {
            IVoters voters = onlyInvolved
                    ? new IVoters.OnlyInvolved(involvedCollaborators)
                    : new IVoters.Everyone(collaborators);
            switch (votingStrategy) {
                case "reject":
                    return reject();
                case "firstVote":
                    return firstVote(voters);
                case "plurality":
                    return plurality(voters);
                case "majority":
                    return majority(voters);
                case "consensus":
                    return consensus(voters);
                default:
                    throw new RuntimeException("invalid voting strategy given");
            }
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

    public Map<Collaborator, String> getVoteResults() {
        return voteResults;
    }

    public void vote(Collaborator collaborator, String versionID) {
        Logger.info("{} voted for version {}", collaborator, versionID);
        if (versionID == null)
            voteResults.remove(collaborator);
        else
            voteResults.put(collaborator, versionID);
    }

    public String getElectedVersionID() {
        if (votingStrategy.resolutionCriterion.isRejected(votingStrategy.voters, voteResults)) {
            Logger.info("resolution criterion rejected, concluding voting phase with neutral version");
            return "neutral";
        }

        if (votingStrategy.resolutionCriterion.isResolved(votingStrategy.voters, voteResults)) {
            Logger.info("resolution criterion resolved, concluding voting phase");
            String electedVersionID = votingStrategy.resolutionOutcome.getElectedVersionID(voteResults);
            if (electedVersionID == null) {
                Logger.info("resolution outcome rejected, concluding voting phase with neutral version");
                return "neutral";
            }
            Logger.info("final elected version is {}", electedVersionID);
            return electedVersionID;
        }

        return null;
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
